-- All fixtures are rolled back. Test both public validation and real signup attribution.
begin;
do $$
declare u uuid := gen_random_uuid(); child uuid := gen_random_uuid(); correction uuid := gen_random_uuid();
  a uuid; code text; original text; rejected int;
begin
  select id into a from public.profiles where role = 'admin' limit 1;
  if a is null then raise exception 'Test requires an existing admin'; end if;
  select count(*) into rejected from public.profiles
  where referral_code is not null and not public.valid_referral_code(referral_code);
  assert rejected = 0, 'Existing account codes are rejected';
  insert into auth.users(id,email,raw_user_meta_data) values(u,u::text || '@referral-test.invalid','{}');
  select referral_code into original from public.profiles where id = u;
  code := 'legacy-' || lower(original);
  update public.profiles set referral_code = code where id = u;
  execute 'set local role anon';
  assert public.valid_referral_code(code), 'Anonymous lowercase validation failed';
  assert public.valid_referral_code(upper(code)), 'Anonymous uppercase validation failed';
  assert public.valid_referral_code(' ' || upper(code) || ' '), 'Whitespace normalization failed';
  assert not public.valid_referral_code('invalid-test-code'), 'Invalid code accepted';
  assert not public.valid_referral_code(null), 'Null code accepted';
  execute 'reset role';
  insert into auth.users(id,email,raw_user_meta_data)
  values(child,child::text || '@referral-test.invalid',jsonb_build_object('referral_code',upper(code)));
  assert (select referred_by = u from public.profiles where id = child), 'Legacy signup attribution failed';
  assert (select count(*) = 1 from public.referrals where referrer_id = u and referred_id = child), 'Legacy signup relationship missing';
  assert (select referral_code = code from public.profiles where id = u), 'Existing code was modified';
  perform set_config('request.jwt.claim.sub',a::text,true);
  insert into auth.users(id,email,raw_user_meta_data) values(correction,correction::text || '@referral-test.invalid','{}');
  perform public.admin_add_referral(upper(code),correction::text || '@referral-test.invalid','Legacy code test');
  assert (select referred_by = u from public.profiles where id = correction), 'Admin legacy attribution failed';
  begin
    update public.profiles set referral_code = upper(code) where id = correction;
    raise exception 'Case-insensitive duplicate code accepted';
  exception when unique_violation then null;
  end;
end;
$$;
rollback;
