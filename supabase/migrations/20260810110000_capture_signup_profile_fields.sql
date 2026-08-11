-- Copy contact information supplied at signup into the durable client profile.
-- `handle_new_user` may have been installed by an earlier migration, so replace
-- it rather than creating an additional trigger.
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

  insert into public.profiles (
    id, email, full_name, phone, country, referral_code, referred_by
  ) values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'country'), ''),
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
