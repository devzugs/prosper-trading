-- ---------------------------------------------------------------------------
-- Phase 11 hardening — fixes two exploitable bugs found during audit:
--
--   1. `profiles_update_own_or_admin` only blocked self-escalation on the
--      `role` column. A user could PATCH their own `kyc_status` to
--      'verified', or reassign their own `referred_by`, via a direct REST
--      call — no UI required.
--
--   2. Neither `deposits` nor `withdrawals` had an `amount > 0` constraint.
--      Worst case: a user submits a withdrawal with a *negative* amount.
--      `approve_withdrawal`'s balance check (`v_wallet_balance <
--      v_withdrawal.amount`) passes trivially for a negative amount, then
--      `cached_balance - v_withdrawal.amount` *increases* the balance and
--      logs it as a completed withdrawal — a self-crediting exploit.
--
-- Also pins `search_path` on every SECURITY DEFINER function (Supabase
-- linter best practice — low real risk here since all refs are already
-- schema-qualified, but cheap to close).
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 1. Extend self-escalation trigger to cover kyc_status + referred_by
-- ---------------------------------------------------------------------------
create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only admins can change role.';
    end if;
    if new.kyc_status is distinct from old.kyc_status then
      raise exception 'Only admins can change KYC status.';
    end if;
    if new.referred_by is distinct from old.referred_by then
      raise exception 'referred_by cannot be changed after signup.';
    end if;
  end if;
  return new;
end;
$$;
-- Trigger `trg_profiles_block_role_escalation` already points at this
-- function name, so no trigger changes needed — the replace is enough.


-- ---------------------------------------------------------------------------
-- 2. Amount must be positive — table-level constraints
-- ---------------------------------------------------------------------------
-- NOT VALID first so this can't be blocked by any pre-existing bad rows;
-- run the VALIDATE statements below once you've confirmed/cleaned the data.
alter table public.deposits
  add constraint deposits_amount_positive check (amount > 0) not valid;

alter table public.withdrawals
  add constraint withdrawals_amount_positive check (amount > 0) not valid;

-- Run these once you've confirmed there's no existing bad data
-- (safe to run immediately on a fresh/dev project):
alter table public.deposits    validate constraint deposits_amount_positive;
alter table public.withdrawals validate constraint withdrawals_amount_positive;


-- ---------------------------------------------------------------------------
-- 3. Defense-in-depth: explicit amount check inside approve_withdrawal
--    (redundant with the table constraint above for the insert path, but
--    protects this function against any other way a bad row could arrive —
--    e.g. a future service-role script, or the constraint being dropped
--    later without anyone noticing this function relied on it)
-- ---------------------------------------------------------------------------
create or replace function public.approve_withdrawal(p_withdrawal_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_wallet_balance numeric;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then raise exception 'Withdrawal not found.'; end if;
  if v_withdrawal.status != 'pending' then raise exception 'Withdrawal already processed.'; end if;
  if v_withdrawal.amount <= 0 then raise exception 'Invalid withdrawal amount.'; end if;

  select cached_balance into v_wallet_balance
  from public.wallets
  where user_id = v_withdrawal.user_id and currency = v_withdrawal.currency
  for update;

  if v_wallet_balance is null or v_wallet_balance < v_withdrawal.amount then
    raise exception 'Insufficient balance to approve this withdrawal.';
  end if;

  update public.withdrawals
  set status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
  where id = p_withdrawal_id;

  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_withdrawal.user_id, 'withdrawal', v_withdrawal.currency, -v_withdrawal.amount, 'completed', 'withdrawals', p_withdrawal_id, v_caller_id
  );

  update public.wallets
  set cached_balance = cached_balance - v_withdrawal.amount, updated_at = now()
  where user_id = v_withdrawal.user_id and currency = v_withdrawal.currency;

end;
$$;


-- ---------------------------------------------------------------------------
-- 4. Pin search_path on the remaining SECURITY DEFINER functions
--    (bodies unchanged from their original migrations — only the
--    `set search_path = ''` line is added)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.approve_deposit(p_deposit_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deposit public.deposits%rowtype;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can approve deposits.';
  end if;

  select * into v_deposit
  from public.deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit record not found.';
  end if;

  if v_deposit.status != 'pending' then
    raise exception 'Deposit is already processed (Status: %).', v_deposit.status;
  end if;

  update public.deposits
  set
    status = 'approved',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_deposit_id;

  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_deposit.user_id, 'deposit', v_deposit.coin, v_deposit.amount, 'completed', 'deposits', p_deposit_id, v_caller_id
  );

  insert into public.wallets (user_id, currency, cached_balance)
  values (v_deposit.user_id, v_deposit.coin, v_deposit.amount)
  on conflict (user_id, currency)
  do update set
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();

end;
$$;

create or replace function public.reject_deposit(p_deposit_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deposit public.deposits%rowtype;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can reject deposits.';
  end if;

  select * into v_deposit
  from public.deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit record not found.';
  end if;

  if v_deposit.status != 'pending' then
    raise exception 'Deposit is already processed (Status: %).', v_deposit.status;
  end if;

  update public.deposits
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_deposit_id;

end;
$$;

create or replace function public.reject_withdrawal(p_withdrawal_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can reject withdrawals.';
  end if;

  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal record not found.';
  end if;

  if v_withdrawal.status != 'pending' then
    raise exception 'Withdrawal is already processed (Status: %).', v_withdrawal.status;
  end if;

  update public.withdrawals
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_withdrawal_id;

end;
$$;

create or replace function public.adjust_balance(
  p_target_user_id uuid,
  p_currency text,
  p_amount numeric,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'Unauthorized.'; end if;
  if p_amount = 0 then raise exception 'Adjustment amount cannot be zero.'; end if;
  if p_reason is null or trim(p_reason) = '' then raise exception 'A reason must be provided for audit purposes.'; end if;

  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by, note
  ) values (
    p_target_user_id, 'adjustment', p_currency, p_amount, 'completed', null, null, v_caller_id, p_reason
  );

  insert into public.wallets (user_id, currency, cached_balance)
  values (p_target_user_id, p_currency, p_amount)
  on conflict (user_id, currency)
  do update set
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();

end;
$$;

create or replace function public.credit_referral(
  p_referral_id uuid,
  p_currency text,
  p_amount numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referral public.referrals%rowtype;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'Unauthorized.'; end if;
  if p_amount <= 0 then raise exception 'Commission amount must be positive.'; end if;

  select * into v_referral
  from public.referrals
  where id = p_referral_id
  for update;

  if not found then raise exception 'Referral not found.'; end if;

  update public.referrals
  set
    status = 'active',
    commission_amount = commission_amount + p_amount
  where id = p_referral_id;

  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_referral.referrer_id, 'referral_bonus', p_currency, p_amount, 'completed', 'referrals', p_referral_id, v_caller_id
  );

  insert into public.wallets (user_id, currency, cached_balance)
  values (v_referral.referrer_id, p_currency, p_amount)
  on conflict (user_id, currency)
  do update set
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();
end;
$$;