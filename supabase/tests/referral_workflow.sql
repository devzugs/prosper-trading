-- supabase db query --linked --file supabase/tests/referral_workflow.sql
-- All fixtures and assertions are rolled back, including on failure.
begin;
do $$
declare
  a uuid; u uuid := gen_random_uuid(); child uuid := gen_random_uuid(); other_user uuid := gen_random_uuid();
  r uuid; d uuid := gen_random_uuid(); c uuid; code text; result jsonb; n int; expected numeric;
begin
  select id into a from public.profiles where role = 'admin' limit 1;
  if a is null then raise exception 'Test requires an existing admin'; end if;
  perform set_config('request.jwt.claim.sub',a::text,true);
  insert into auth.users(id,email,raw_user_meta_data) values(u,u::text || '@referral-test.invalid','{"full_name":"Referral test"}');
  select referral_code into code from public.profiles where id = u;
  assert public.valid_referral_code(lower(code)), 'Code normalization failed';
  assert not public.valid_referral_code('invalid-referral-test-code'), 'Invalid code accepted';
  insert into auth.users(id,email,raw_user_meta_data) values(child,child::text || '@referral-test.invalid',jsonb_build_object('referral_code',lower(code),'full_name','Referred test'));
  select id into r from public.referrals where referred_id = child and referrer_id = u;
  assert r is not null, 'Signup attribution failed';
  result := public.referral_dashboard(u);
  assert (result #>> '{stats,totalReferrals}')::int = 1, 'Signup count failed';
  assert (result #>> '{stats,activeReferrals}')::int = 0, 'Signup must start pending';
  assert result #>> '{users,0,name}' = 'Referred test', 'Referral name lookup failed';
  insert into public.deposits(id,user_id,coin,amount,status) values(d,child,'USD',1000,'approved');
  begin
    perform public.admin_credit_referral_deposit(r,d);
    raise exception 'Pending referral credited';
  exception when raise_exception then
    if sqlerrm <> 'Activate this referral before crediting commission' then raise; end if;
  end;
  perform public.admin_set_referral_status(r,'active','Test activation');
  perform public.admin_credit_referral_deposit(r,d);
  perform public.admin_credit_referral_deposit(r,d);
  select count(*) into n from public.referral_commissions where deposit_id = d;
  assert n = 1, 'Duplicate commission';
  result := public.referral_dashboard(u);
  assert (result #>> '{stats,totalEarned,USD}')::numeric = 100, 'Bronze rate failed';
  assert (result #>> '{stats,availableEarned,USD}')::numeric = 0, 'Commission must not release available earnings';
  perform public.admin_set_referral_available(u,25,'Separate admin availability');
  perform public.admin_set_referral_available(u,25,'Retry');
  assert (public.referral_dashboard(u) #>> '{stats,availableEarned,USD}')::numeric = 25, 'Admin availability failed';
  assert (select count(*) = 1 from public.referral_availability_history where user_id = u), 'Duplicate availability audit';
  begin
    perform public.admin_set_referral_available(u,-1,'Invalid amount');
    raise exception 'Negative availability accepted';
  exception when raise_exception then if sqlerrm <> 'Available earnings must be a non-negative USD amount' then raise; end if; end;
  assert (select cached_balance = 100 from public.wallets where user_id = u and currency = 'USD'), 'Wallet double credit';
  perform set_config('request.jwt.claim.sub',child::text,true);
  begin
    perform public.admin_set_referral_available(u,500,'Unauthorized');
    raise exception 'Non-admin availability change allowed';
  exception when raise_exception then if sqlerrm <> 'Unauthorized' then raise; end if; end;
  begin
    perform public.referral_dashboard(u);
    raise exception 'Cross-user read allowed';
  exception when raise_exception then if sqlerrm <> 'Unauthorized' then raise; end if; end;
  begin
    perform public.admin_set_referral_status(r,'inactive','Unauthorized test');
    raise exception 'Non-admin mutation allowed';
  exception when raise_exception then if sqlerrm <> 'Unauthorized' then raise; end if; end;
  assert not has_function_privilege('authenticated','public.credit_referral(uuid,text,numeric)','EXECUTE'), 'Old credit function still exposed';
  perform set_config('request.jwt.claim.sub',u::text,true);
  execute 'set local role authenticated';
  assert (public.referral_dashboard() #>> '{stats,totalReferrals}')::int = 1, 'Own dashboard failed';
  assert (select count(*) = 0 from public.profiles where id = child), 'Unrelated profile exposed';
  assert (select count(*) = 1 from public.referral_commissions where referral_id = r), 'Commission read policy failed';
  execute 'reset role';
  perform set_config('request.jwt.claim.sub',a::text,true);
  -- Build active counts through the real signup/status workflow and exercise every boundary.
  for n in 2..30 loop
    other_user := gen_random_uuid();
    insert into auth.users(id,email,raw_user_meta_data) values(other_user,other_user::text || '@referral-test.invalid',jsonb_build_object('referral_code',code));
    perform public.admin_set_referral_status((select id from public.referrals where referred_id = other_user),'active','Boundary test');
    if n in (4,5,14,15,29,30) then
      d := gen_random_uuid();
      insert into public.deposits(id,user_id,coin,amount,status) values(d,child,'USDT',100,'approved');
      perform public.admin_credit_referral_deposit(r,d);
      expected := case when n < 5 then 10 when n < 15 then 20 when n < 30 then 30 else 40 end;
      assert (select rate = expected and amount = expected from public.referral_commissions where deposit_id = d), 'Tier boundary failed';
    end if;
  end loop;
  result := public.referral_dashboard(u);
  assert (result #>> '{stats,totalReferrals}')::int = 30, 'Full aggregate count failed';
  assert jsonb_array_length(result -> 'users') = 25, 'Pagination failed';
  assert jsonb_array_length(public.referral_dashboard(u,25) -> 'users') = 5, 'Second page failed';
  assert (result #>> '{stats,totalEarned,USD}')::numeric = 100, 'Currencies mixed';
  -- Wallet activity must not overwrite the separately managed referral card.
  d := gen_random_uuid();
  insert into public.withdrawals(id,user_id,currency,amount,status,method) values(d,u,'USD',25,'pending','crypto');
  assert (public.referral_dashboard(u) #>> '{stats,availableEarned,USD}')::numeric = 25, 'Withdrawal overwrote admin availability';
  perform public.reject_withdrawal(d);
  assert (public.referral_dashboard(u) #>> '{stats,availableEarned,USD}')::numeric = 25, 'Rejection overwrote admin availability';
  select id into c from public.referral_commissions where referral_id = r and currency = 'USD';
  perform public.admin_reverse_referral_commission(c,'Test reversal');
  perform public.admin_reverse_referral_commission(c,'Test retry');
  assert (public.referral_dashboard(u) #>> '{stats,totalEarned,USD}')::numeric = 0, 'Reversal earnings failed';
  assert (select cached_balance = 0 from public.wallets where user_id = u and currency = 'USD'), 'Reversal wallet failed';
  assert (public.referral_dashboard(u) #>> '{stats,availableEarned,USD}')::numeric = 25, 'Reversal overwrote admin availability';
  perform public.admin_set_referral_available(u,0,'Reset available earnings');
  assert (public.referral_dashboard(u) #>> '{stats,availableEarned,USD}')::numeric = 0, 'Admin reset failed';
  perform public.admin_set_referral_status(r,'inactive','Test inactive');
  assert (public.referral_dashboard(u) #>> '{stats,activeReferrals}')::int = 29, 'Inactivation failed';
  begin
    perform public.admin_remove_referral(r,'Test removal');
    raise exception 'Financial history was removable';
  exception when raise_exception then if sqlerrm <> 'A referral with financial history cannot be removed; mark it inactive instead' then raise; end if; end;
  other_user := gen_random_uuid();
  insert into auth.users(id,email,raw_user_meta_data) values(other_user,other_user::text || '@referral-test.invalid','{}');
  perform public.admin_add_referral(code,other_user::text || '@referral-test.invalid','Attribution correction');
  assert (public.referral_dashboard(u) #>> '{stats,totalReferrals}')::int = 31, 'Admin add count failed';
  assert (select referred_by = u from public.profiles where id = other_user), 'Profile attribution not synchronized';
  select id into r from public.referrals where referred_id = other_user;
  perform public.admin_remove_referral(r,'Wrong attribution');
  assert (public.referral_dashboard(u) #>> '{stats,totalReferrals}')::int = 30, 'Admin remove count failed';
  assert (select referred_by is null from public.profiles where id = other_user), 'Profile attribution not cleared';
  assert (select count(*) = 2 from public.referral_status_history where referral_id = r), 'Correction history lost';
end;
$$;
rollback;
