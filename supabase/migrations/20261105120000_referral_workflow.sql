-- Referral records drive counts; approved deposits drive admin-approved commissions.
update public.referral_tiers set commission_rate = case id
  when 'bronze' then 10 when 'silver' then 20 when 'gold' then 30 when 'diamond' then 40 end
where id in ('bronze', 'silver', 'gold', 'diamond');

create table public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id),
  deposit_id uuid not null unique references public.deposits(id),
  currency text not null,
  base_amount numeric(20,8) not null,
  rate numeric(5,2) not null,
  amount numeric(20,8) not null check (amount > 0),
  reversed_at timestamptz,
  reversed_by uuid references auth.users(id),
  reversal_reason text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.referral_commissions enable row level security;
create policy referral_commissions_read on public.referral_commissions for select to authenticated
using (public.is_admin() or exists (select 1 from public.referrals r where r.id = referral_id and r.referrer_id = auth.uid()));
grant select on public.referral_commissions to authenticated;

create table public.referral_status_history (
  id uuid primary key default gen_random_uuid(),
  -- Retain attribution history even when an uncredited relationship is removed.
  referral_id uuid not null,
  referrer_id uuid,
  referred_id uuid,
  old_status text not null,
  new_status text not null,
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.referral_status_history enable row level security;
create policy referral_status_admin_read on public.referral_status_history for select to authenticated using (public.is_admin());
grant select on public.referral_status_history to authenticated;

create function public.admin_add_referral(p_referrer_code text, p_referred_email text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_referrer uuid; v_referred uuid; v_id uuid;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A reason is required'; end if;
  select id into v_referrer from public.profiles where referral_code = upper(trim(p_referrer_code));
  select id into v_referred from public.profiles where lower(email) = lower(trim(p_referred_email)) for update;
  if v_referrer is null or v_referred is null then raise exception 'Referrer code or referred email not found'; end if;
  if v_referrer = v_referred then raise exception 'Self-referrals are not allowed'; end if;
  if exists(select 1 from public.referrals where referred_id = v_referred) then raise exception 'This user already has a referrer'; end if;
  insert into public.referrals(referrer_id,referred_id,status) values(v_referrer,v_referred,'pending') returning id into v_id;
  update public.profiles set referred_by = v_referrer where id = v_referred;
  insert into public.referral_status_history(referral_id,referrer_id,referred_id,old_status,new_status,reason,created_by)
  values(v_id,v_referrer,v_referred,'none','pending',trim(p_reason),auth.uid());
end; $$;

create function public.admin_remove_referral(p_referral_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.referrals%rowtype;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A reason is required'; end if;
  select * into r from public.referrals where id = p_referral_id for update;
  if not found then raise exception 'Referral not found'; end if;
  if exists(select 1 from public.referral_commissions where referral_id = r.id)
    or exists(select 1 from public.transactions where reference_table = 'referrals' and reference_id = r.id)
    or r.commission_amount <> 0 then raise exception 'A referral with financial history cannot be removed; mark it inactive instead'; end if;
  insert into public.referral_status_history(referral_id,referrer_id,referred_id,old_status,new_status,reason,created_by)
  values(r.id,r.referrer_id,r.referred_id,r.status,'removed',trim(p_reason),auth.uid());
  update public.profiles set referred_by = null where id = r.referred_id;
  delete from public.referrals where id = r.id;
end; $$;

create function public.admin_set_referral_status(p_referral_id uuid, p_status text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old text;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if p_status is null or p_status not in ('pending','active','inactive') then raise exception 'Invalid status'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required'; end if;
  select status into v_old from public.referrals where id = p_referral_id for update;
  if not found then raise exception 'Referral not found'; end if;
  if v_old = p_status then return; end if;
  update public.referrals set status = p_status where id = p_referral_id;
  insert into public.referral_status_history(referral_id,old_status,new_status,reason,created_by)
  values(p_referral_id,v_old,p_status,trim(p_reason),auth.uid());
end; $$;

-- Replace unrestricted manual amounts with one credit per approved deposit.
revoke execute on function public.credit_referral(uuid,text,numeric) from public, anon, authenticated;
create function public.admin_credit_referral_deposit(p_referral_id uuid, p_deposit_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.referrals%rowtype; d public.deposits%rowtype; v_rate numeric; v_amount numeric;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  select * into r from public.referrals where id = p_referral_id for update;
  if not found then raise exception 'Referral not found'; end if;
  -- Retried requests succeed without a second wallet credit.
  if exists(select 1 from public.referral_commissions where deposit_id = p_deposit_id and referral_id = r.id) then return; end if;
  if r.status <> 'active' then raise exception 'Activate this referral before crediting commission'; end if;
  select * into d from public.deposits where id = p_deposit_id for update;
  if not found or d.user_id <> r.referred_id or d.status <> 'approved' then raise exception 'Select an approved deposit belonging to this referral'; end if;
  select commission_rate into v_rate from public.referral_tiers
  where min_referrals <= (select count(*) from public.referrals where referrer_id = r.referrer_id and status = 'active')
  order by min_referrals desc limit 1;
  if v_rate is null then raise exception 'Referral tiers are not configured'; end if;
  v_amount := round(d.amount * v_rate / 100, 8);
  if v_amount <= 0 then raise exception 'Commission is too small to credit'; end if;
  insert into public.referral_commissions(referral_id,deposit_id,currency,base_amount,rate,amount,created_by)
  values(r.id,d.id,d.coin,d.amount,v_rate,v_amount,auth.uid());
  insert into public.transactions(user_id,type,currency,amount,status,reference_table,reference_id,created_by,note)
  values(r.referrer_id,'referral_bonus',d.coin,v_amount,'completed','referrals',r.id,auth.uid(),
    'Deposit ' || d.id::text || ' at ' || v_rate::text || '%');
  insert into public.wallets(user_id,currency,cached_balance) values(r.referrer_id,d.coin,v_amount)
  on conflict(user_id,currency) do update set cached_balance = public.wallets.cached_balance + excluded.cached_balance, updated_at = now();
  -- Legacy compatibility only. Displays use currency-aware transaction aggregates.
  update public.referrals set commission_amount = commission_amount + v_amount where id = r.id;
end; $$;

create function public.admin_reverse_referral_commission(p_commission_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare c public.referral_commissions%rowtype; v_user uuid; v_balance numeric; v_reserved numeric;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A reversal reason is required'; end if;
  select * into c from public.referral_commissions where id = p_commission_id for update;
  if not found then raise exception 'Commission not found'; end if;
  if c.reversed_at is not null then return; end if;
  select referrer_id into v_user from public.referrals where id = c.referral_id;
  select cached_balance into v_balance from public.wallets where user_id = v_user and currency = c.currency for update;
  select coalesce(sum(amount),0) into v_reserved from public.withdrawals where user_id = v_user and currency = c.currency and status = 'pending';
  if v_balance is null or v_balance - v_reserved < c.amount then raise exception 'Insufficient unreserved wallet balance to reverse this commission'; end if;
  update public.referral_commissions set reversed_at = now(), reversed_by = auth.uid(), reversal_reason = trim(p_reason) where id = c.id;
  insert into public.transactions(user_id,type,currency,amount,status,reference_table,reference_id,created_by,note)
  values(v_user,'referral_bonus',c.currency,-c.amount,'completed','referrals',c.referral_id,auth.uid(),'Commission reversal: ' || c.id::text || '. ' || trim(p_reason));
  update public.wallets set cached_balance = cached_balance - c.amount, updated_at = now() where user_id = v_user and currency = c.currency;
  update public.referrals set commission_amount = commission_amount - c.amount where id = c.referral_id;
end; $$;

create function public.referral_dashboard(p_user_id uuid default null, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := coalesce(p_user_id,auth.uid()); v_result jsonb;
begin
  if auth.uid() is null or (v_user <> auth.uid() and not public.is_admin()) then raise exception 'Unauthorized'; end if;
  if p_offset is null or p_offset < 0 then raise exception 'Invalid offset'; end if;
  with ledger as (
    select currency, id, created_at, type, amount,
      sum(case when type = 'referral_bonus' or amount < 0 then amount else 0 end)
      over(partition by currency order by created_at,id rows unbounded preceding) as running
    from public.transactions where user_id = v_user and status = 'completed'
  ), earned as (
    select currency, sum(case when type = 'referral_bonus' then amount else 0 end) as total,
      sum(case when type = 'referral_bonus' or amount < 0 then amount else 0 end) - least(0,min(running)) as remaining
    from ledger group by currency having bool_or(type = 'referral_bonus')
  ), money as (
    select e.currency, e.total,
      greatest(0, least(e.remaining,coalesce(w.cached_balance,0)) - coalesce((select sum(amount) from public.withdrawals where user_id = v_user and currency = e.currency and status = 'pending'),0)) as available
    from earned e left join public.wallets w on w.user_id = v_user and w.currency = e.currency
  ), page as (
    select r.*, p.full_name, p.active_plan from public.referrals r
    left join public.profiles p on p.id = r.referred_id
    where r.referrer_id = v_user order by r.created_at desc,r.id limit 25 offset p_offset
  )
  select jsonb_build_object(
    'stats', jsonb_build_object(
      'totalReferrals',(select count(*) from public.referrals where referrer_id = v_user),
      'activeReferrals',(select count(*) from public.referrals where referrer_id = v_user and status = 'active'),
      'totalEarned',coalesce((select jsonb_object_agg(currency,total) from money),'{}'::jsonb),
      'availableEarned',coalesce((select jsonb_object_agg(currency,available) from money),'{}'::jsonb)),
    'referralCode',(select referral_code from public.profiles where id = v_user),
    'tiers',(select jsonb_agg(jsonb_build_object('id',id,'name',name,'commission',commission_rate,'minReferrals',min_referrals,'maxReferrals',max_referrals) order by min_referrals) from public.referral_tiers),
    'users',coalesce((select jsonb_agg(jsonb_build_object(
      'id',r.id,'name',coalesce(r.full_name,'Member'),'status',r.status,'plan',coalesce(r.active_plan,'No active plan'),'joinedDate',r.created_at,
      'totalDeposited',coalesce((select jsonb_object_agg(currency,amount) from (select coin as currency,sum(amount) as amount from public.deposits where user_id = r.referred_id and status = 'approved' group by coin) s),'{}'::jsonb),
      'commissionEarned',coalesce((select jsonb_object_agg(currency,amount) from (select currency,sum(amount) as amount from public.transactions where user_id = v_user and type = 'referral_bonus' and status = 'completed' and reference_table = 'referrals' and reference_id = r.id group by currency) s),'{}'::jsonb)
    ) order by r.created_at desc,r.id) from page r),'[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

revoke all on function public.admin_set_referral_status(uuid,text,text) from public, anon;
revoke all on function public.admin_add_referral(text,text,text) from public, anon;
revoke all on function public.admin_remove_referral(uuid,text) from public, anon;
revoke all on function public.admin_credit_referral_deposit(uuid,uuid) from public, anon;
revoke all on function public.admin_reverse_referral_commission(uuid,text) from public, anon;
revoke all on function public.referral_dashboard(uuid,int) from public, anon;
grant execute on function public.admin_set_referral_status(uuid,text,text) to authenticated;
grant execute on function public.admin_add_referral(text,text,text) to authenticated;
grant execute on function public.admin_remove_referral(uuid,text) to authenticated;
grant execute on function public.admin_credit_referral_deposit(uuid,uuid) to authenticated;
grant execute on function public.admin_reverse_referral_commission(uuid,text) to authenticated;
grant execute on function public.referral_dashboard(uuid,int) to authenticated;

-- Fail explicitly rather than silently losing attribution for an invalid code.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_referrer uuid; v_code text := nullif(upper(trim(new.raw_user_meta_data ->> 'referral_code')), '');
begin
  if v_code is not null then
    select id into v_referrer from public.profiles where referral_code = v_code;
    if v_referrer is null then raise exception 'Invalid referral code'; end if;
  end if;
  insert into public.profiles(id,email,full_name,phone,country,referral_code,referred_by)
  values(new.id,new.email,nullif(trim(new.raw_user_meta_data ->> 'full_name'),''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'),''),nullif(trim(new.raw_user_meta_data ->> 'country'),''),public.generate_referral_code(),v_referrer);
  if v_referrer is not null then
    insert into public.referrals(referrer_id,referred_id,status) values(v_referrer,new.id,'pending');
  end if;
  return new;
end; $$;

create function public.valid_referral_code(p_code text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where referral_code = upper(trim(p_code)));
$$;
revoke all on function public.valid_referral_code(text) from public;
grant execute on function public.valid_referral_code(text) to anon,authenticated;
