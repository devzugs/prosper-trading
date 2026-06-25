-- ── Shared helper: auto-update `updated_at` columns ─────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ── profiles ─────────────────────────────────────────────────────────────--
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  country       text,                       -- shown on the leaderboard
  role          text not null default 'user'
                  check (role in ('user', 'admin')),
  kyc_status    text not null default 'unverified'
                  check (kyc_status in ('unverified', 'pending', 'verified', 'rejected')),
  referred_by   uuid references auth.users(id),  -- who referred this user, if anyone
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ── investment_plans ─────────────────────────────────────────────────────--
create table public.investment_plans (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,        -- 'Starter' | 'Growth' | 'Elite'
  min_investment    numeric(20,2) not null,
  max_investment    numeric(20,2),                -- nullable = no cap
  monthly_roi_rate  numeric(5,2) not null,         -- e.g. 8.00 = up to 8% monthly
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- seed the three plans from the landing page
insert into public.investment_plans (name, min_investment, max_investment, monthly_roi_rate) values
  ('Starter', 500,    4999.99, 8.00),
  ('Growth',  5000,   19999.99, 15.00),
  ('Elite',   20000,  null,     25.00);


-- ── user_investments ─────────────────────────────────────────────────────--
create table public.user_investments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     uuid not null references public.investment_plans(id),
  amount      numeric(20,2) not null,
  status      text not null default 'active'
                check (status in ('active', 'completed', 'cancelled')),
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_user_investments_user on public.user_investments (user_id);


-- ── wallets (cached balance per currency — never written to directly) ───--
create table public.wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  currency        text not null,              -- 'BTC' | 'ETH' | 'USDT' | 'USD' ...
  cached_balance  numeric(20,8) not null default 0,
  updated_at      timestamptz not null default now(),
  unique (user_id, currency)
);

create trigger trg_wallets_updated_at
  before update on public.wallets
  for each row execute function public.set_updated_at();


-- ── transactions (the ledger — source of truth for all money movement) ──--
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null
                     check (type in ('deposit', 'withdrawal', 'referral_bonus',
                                      'roi_payout', 'adjustment', 'fee')),
  currency         text not null,
  amount           numeric(20,8) not null,     -- positive = credit, negative = debit
  status           text not null default 'completed'
                     check (status in ('pending', 'completed', 'reversed')),
  reference_table  text,                       -- 'deposits' | 'withdrawals' | 'referrals' | 'user_investments'
  reference_id     uuid,
  created_by       uuid references auth.users(id),  -- admin who triggered it; null = system/self
  note             text,
  created_at       timestamptz not null default now()
);

create index idx_transactions_user on public.transactions (user_id);
create index idx_transactions_reference on public.transactions (reference_table, reference_id);
create index idx_transactions_type_created on public.transactions (type, created_at);


-- ── deposits ─────────────────────────────────────────────────────────────--
create table public.deposits (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  coin             text not null,
  network          text,
  amount           numeric(20,8) not null,
  deposit_address  text,
  tx_hash          text,
  proof_url        text,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index idx_deposits_user on public.deposits (user_id);
create index idx_deposits_status on public.deposits (status);


-- ── withdrawals ──────────────────────────────────────────────────────────--
create table public.withdrawals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  method           text not null check (method in ('crypto', 'wire', 'card')),
  currency         text not null,
  amount           numeric(20,8) not null,
  payment_details  jsonb not null default '{}'::jsonb,
  proof_url        text,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index idx_withdrawals_user on public.withdrawals (user_id);
create index idx_withdrawals_status on public.withdrawals (status);


-- ── payment_methods (saved withdrawal destinations) ─────────────────────--
create table public.payment_methods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  method      text not null check (method in ('crypto', 'wire', 'card')),
  label       text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index idx_payment_methods_user on public.payment_methods (user_id);


-- ── referral_tiers (lookup table, matches referralData.js) ──────────────--
create table public.referral_tiers (
  id               text primary key,            -- 'bronze' | 'silver' | 'gold' | 'diamond'
  name             text not null,
  min_referrals    int not null,
  max_referrals    int,                          -- null = no upper bound
  commission_rate  numeric(5,2) not null         -- percentage, e.g. 8.00
);

insert into public.referral_tiers (id, name, min_referrals, max_referrals, commission_rate) values
  ('bronze',   'Bronze',   0,  4,    5.00),
  ('silver',   'Silver',   5,  14,   8.00),
  ('gold',     'Gold',     15, 29,   12.00),
  ('diamond',  'Diamond',  30, null, 15.00);


-- ── referrals ────────────────────────────────────────────────────────────--
create table public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references auth.users(id) on delete cascade,
  referred_id   uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'active', 'inactive')),
  created_at    timestamptz not null default now(),
  unique (referred_id)   -- a user can only have been referred by one person
);

create index idx_referrals_referrer on public.referrals (referrer_id);


-- ── support_tickets + support_messages ───────────────────────────────────--
create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  status      text not null default 'open'
                check (status in ('open', 'answered', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table public.support_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.support_tickets(id) on delete cascade,
  sender_id    uuid not null references auth.users(id),
  sender_role  text not null check (sender_role in ('user', 'admin')),
  message      text not null,
  created_at   timestamptz not null default now()
);

create index idx_support_messages_ticket on public.support_messages (ticket_id);


