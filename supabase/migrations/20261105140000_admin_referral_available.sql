-- Availability is explicitly set by an admin, independently of commission credits.
create table public.referral_availability (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  amount_usd numeric(20,2) not null default 0 check (amount_usd >= 0 and amount_usd <> 'NaN'::numeric),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
create table public.referral_availability_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  old_amount_usd numeric(20,2) not null,
  new_amount_usd numeric(20,2) not null,
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.referral_availability enable row level security;
alter table public.referral_availability_history enable row level security;
create policy referral_availability_read on public.referral_availability for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy referral_availability_history_admin on public.referral_availability_history for select to authenticated
  using (public.is_admin());
grant select on public.referral_availability, public.referral_availability_history to authenticated;

create function public.admin_set_referral_available(p_user_id uuid, p_amount_usd numeric, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old numeric; v_amount numeric;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if p_amount_usd is null or p_amount_usd::text in ('NaN','Infinity','-Infinity') or p_amount_usd < 0 then
    raise exception 'Available earnings must be a non-negative USD amount';
  end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A reason is required'; end if;
  v_amount := round(p_amount_usd,2);
  -- Serialize initial creation as well as later changes for an accurate audit trail.
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then raise exception 'User not found'; end if;
  select amount_usd into v_old from public.referral_availability where user_id = p_user_id;
  v_old := coalesce(v_old,0);
  if v_old = v_amount then return; end if;
  insert into public.referral_availability(user_id,amount_usd,updated_by)
  values(p_user_id,v_amount,auth.uid())
  on conflict(user_id) do update set amount_usd = excluded.amount_usd, updated_by = auth.uid(), updated_at = now();
  insert into public.referral_availability_history(user_id,old_amount_usd,new_amount_usd,reason,created_by)
  values(p_user_id,v_old,v_amount,trim(p_reason),auth.uid());
end; $$;
revoke all on function public.admin_set_referral_available(uuid,numeric,text) from public,anon;
grant execute on function public.admin_set_referral_available(uuid,numeric,text) to authenticated;

create or replace function public.referral_dashboard(p_user_id uuid default null, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := coalesce(p_user_id,auth.uid()); v_result jsonb;
begin
  if auth.uid() is null or (v_user <> auth.uid() and not public.is_admin()) then raise exception 'Unauthorized'; end if;
  if p_offset is null or p_offset < 0 then raise exception 'Invalid offset'; end if;
  with money as (
    select currency, sum(amount) as total from public.transactions
    where user_id = v_user and type = 'referral_bonus' and status = 'completed' group by currency
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
      'availableEarned',jsonb_build_object('USD',coalesce((select amount_usd from public.referral_availability where user_id = v_user),0))),
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
