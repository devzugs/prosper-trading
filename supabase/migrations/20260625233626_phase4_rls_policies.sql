-- Phase 4 — Row Level Security
-- Matches the actual schema from migrations 20260624231159 + 20260624234230
-- Create migration: supabase migration new phase4_rls_policies
-- Apply: supabase db push

-- ---------------------------------------------------------------------------
-- Helper: is the calling user an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables (it's OFF by default, easy to forget)
-- ---------------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.investment_plans      enable row level security;
alter table public.user_investments      enable row level security;
alter table public.wallets               enable row level security;
alter table public.transactions          enable row level security;
alter table public.deposits              enable row level security;
alter table public.withdrawals           enable row level security;
alter table public.payment_methods       enable row level security;
alter table public.referral_tiers        enable row level security;
alter table public.referrals             enable row level security;
alter table public.support_tickets       enable row level security;
alter table public.support_messages      enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — user reads/updates own; admin reads/updates all; block role escalation
-- ---------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- Prevent users from promoting themselves to admin (RLS doesn't support column-level,
-- so a trigger does the work for the role column specifically)
create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change role';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_block_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- ---------------------------------------------------------------------------
-- investment_plans — lookup table, read-only to everyone
-- ---------------------------------------------------------------------------
create policy "investment_plans_select_all"
  on public.investment_plans for select
  using (true);

-- ---------------------------------------------------------------------------
-- user_investments — user reads own; admin reads all; no client writes
-- ---------------------------------------------------------------------------
create policy "user_investments_select_own_or_admin"
  on public.user_investments for select
  using (user_id = auth.uid() or public.is_admin());

-- Writes only via RPC in Phase 5 (e.g., when a deposit is approved and a user
-- gets enrolled in a plan, or when an ROI payout is issued)

-- ---------------------------------------------------------------------------
-- wallets — user reads own; admin reads all; no client writes (RPC only in Phase 5)
-- ---------------------------------------------------------------------------
create policy "wallets_select_own_or_admin"
  on public.wallets for select
  using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies. Balance changes only via secure RPCs.

-- ---------------------------------------------------------------------------
-- transactions — the ledger; read-only; writes only via RPCs
-- ---------------------------------------------------------------------------
create policy "transactions_select_own_or_admin"
  on public.transactions for select
  using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies. All money changes go through:
--   - approve_deposit()
--   - approve_withdrawal()
--   - issue_roi_payout()  (Phase 5)
--   - adjust_balance()    (Phase 5 admin correction)
-- Never direct client table writes.

-- ---------------------------------------------------------------------------
-- deposits — user insert/select own; admin update status
-- ---------------------------------------------------------------------------
create policy "deposits_select_own_or_admin"
  on public.deposits for select
  using (user_id = auth.uid() or public.is_admin());

create policy "deposits_insert_own"
  on public.deposits for insert
  with check (user_id = auth.uid());

create policy "deposits_update_admin_only"
  on public.deposits for update
  using (public.is_admin());
-- No delete policy for anyone.

-- ---------------------------------------------------------------------------
-- withdrawals — user insert/select own; admin update status
-- ---------------------------------------------------------------------------
create policy "withdrawals_select_own_or_admin"
  on public.withdrawals for select
  using (user_id = auth.uid() or public.is_admin());

create policy "withdrawals_insert_own"
  on public.withdrawals for insert
  with check (user_id = auth.uid());

create policy "withdrawals_update_admin_only"
  on public.withdrawals for update
  using (public.is_admin());
-- No delete policy.

-- ---------------------------------------------------------------------------
-- payment_methods — user full CRUD own; admin read-only
-- ---------------------------------------------------------------------------
create policy "payment_methods_select_own_or_admin"
  on public.payment_methods for select
  using (user_id = auth.uid() or public.is_admin());

create policy "payment_methods_insert_own"
  on public.payment_methods for insert
  with check (user_id = auth.uid());

create policy "payment_methods_update_own"
  on public.payment_methods for update
  using (user_id = auth.uid());

create policy "payment_methods_delete_own"
  on public.payment_methods for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- referral_tiers — lookup table, read-only
-- ---------------------------------------------------------------------------
create policy "referral_tiers_select_all"
  on public.referral_tiers for select
  using (true);

-- ---------------------------------------------------------------------------
-- referrals — referrer/referred/admin can read; writes only via RPCs
-- ---------------------------------------------------------------------------
create policy "referrals_select_participant_or_admin"
  on public.referrals for select
  using (
    referrer_id = auth.uid()
    or referred_id = auth.uid()
    or public.is_admin()
  );

-- No insert/update/delete for clients. Referral creation + status changes
-- happen via Phase 5 RPCs (e.g., when a user signs up with a referral code,
-- or when a referred user's first deposit is approved).

-- ---------------------------------------------------------------------------
-- support_tickets — user sees/creates own; admin sees/updates all
-- ---------------------------------------------------------------------------
create policy "support_tickets_select_own_or_admin"
  on public.support_tickets for select
  using (user_id = auth.uid() or public.is_admin());

create policy "support_tickets_insert_own"
  on public.support_tickets for insert
  with check (user_id = auth.uid());

create policy "support_tickets_update_own_or_admin"
  on public.support_tickets for update
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- support_messages — access based on ticket ownership; writes only via RPCs
-- ---------------------------------------------------------------------------
-- A message is readable if the user is the ticket owner OR is an admin OR is the sender
create policy "support_messages_select_via_ticket"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_tickets st
      where st.id = support_messages.ticket_id
      and (st.user_id = auth.uid() or public.is_admin())
    )
    or sender_id = auth.uid()
  );

-- No insert/update/delete for clients. Message creation goes through
-- an RPC in Phase 5 that validates the ticket owner/admin and enforces
-- sender_role based on caller's profile.role.

-- ---------------------------------------------------------------------------
-- SELF-TEST: Run these as a logged-in non-admin user (anon key, not service_role)
-- ---------------------------------------------------------------------------
-- Test 1: Read own profile
--   select * from profiles where id = auth.uid();
--   Expected: 1 row (your profile)
--
-- Test 2: Read others' profiles
--   select * from profiles where id != auth.uid() limit 1;
--   Expected: 0 rows (RLS blocks it)
--
-- Test 3: Read own transactions
--   select * from transactions where user_id = auth.uid();
--   Expected: your transactions (if any)
--
-- Test 4: Try to INSERT a transaction (should fail — no policy exists)
--   insert into transactions (user_id, type, currency, amount, status)
--   values (auth.uid(), 'deposit', 'USD', 100, 'completed');
--   Expected: error or 0 rows affected
--
-- Test 5: Try to UPDATE a wallet balance (should fail — no policy exists)
--   update wallets set cached_balance = 999999 where user_id = auth.uid();
--   Expected: 0 rows affected
--
-- Test 6: Create a deposit request (should succeed)
--   insert into deposits (user_id, coin, amount)
--   values (auth.uid(), 'BTC', 0.1)
--   returning id;
--   Expected: 1 row inserted
--
-- Test 7: Try to INSERT a deposit for another user (should fail)
--   insert into deposits (user_id, coin, amount)
--   values ('<another-uuid>', 'BTC', 0.1);
--   Expected: error or 0 rows affected
--
-- Test 8: Create a support ticket (should succeed)
--   insert into support_tickets (user_id, subject)
--   values (auth.uid(), 'Help with deposit')
--   returning id;
--   Expected: 1 row inserted
--
-- Test 9: Try to update someone else's support ticket (should fail)
--   update support_tickets set status = 'closed' where user_id != auth.uid();
--   Expected: 0 rows affected