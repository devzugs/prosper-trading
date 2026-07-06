
-- 1. New columns -------------------------------------------------------------
alter table public.profiles
  add column referral_code text unique;

alter table public.referrals
  add column commission_amount numeric(20,2) not null default 0;


-- 2. Code generator -----------------------------------------------------------
-- Short, human-shareable, collision-checked. 8 chars, uppercase base36.
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  v_code text;
  v_exists boolean;
  v_attempts int := 0;
begin
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    select exists(select 1 from public.profiles where referral_code = v_code) into v_exists;
    v_attempts := v_attempts + 1;
    if not v_exists then
      return v_code;
    end if;
    if v_attempts > 10 then
      raise exception 'Could not generate a unique referral code after 10 attempts.';
    end if;
  end loop;
end;
$$;


-- 3. Backfill existing profiles that predate this column ---------------------
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null;


-- 4. handle_new_user: generate own code, resolve inbound code, capture
--    referred_by, and open a referrals row -----------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referrer_id uuid;
  v_inbound_code text;
begin
  v_inbound_code := new.raw_user_meta_data ->> 'referral_code';

  if v_inbound_code is not null and length(trim(v_inbound_code)) > 0 then
    select id into v_referrer_id
    from public.profiles
    where referral_code = upper(trim(v_inbound_code));
  end if;

  insert into public.profiles (id, email, full_name, referral_code, referred_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    public.generate_referral_code(),
    v_referrer_id
  );

  if v_referrer_id is not null then
    insert into public.referrals (referrer_id, referred_id, status)
    values (v_referrer_id, new.id, 'pending');
  end if;

  return new;
end;
$$;

-- Note: `country` capture is still intentionally left out of this trigger —
-- unrelated to referrals, kept as-was.


-- 5. credit_referral wrote to `transactions` and `wallets` but never to
--    `referrals.commission_amount` — which the referral UI now reads per
--    referred user. Re-create it with that one line added; everything else
--    is unchanged from 20260630110857_money_rpcs.sql.
create or replace function public.credit_referral(
  p_referral_id uuid,
  p_currency text,
  p_amount numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_referral public.referrals%rowtype;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'Unauthorized.'; end if;

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