-- Preserve legacy codes and links while matching both sides case-insensitively.
create unique index profiles_referral_code_normalized_key on public.profiles (upper(trim(referral_code)));

create or replace function public.admin_add_referral(p_referrer_code text, p_referred_email text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_referrer uuid; v_referred uuid; v_id uuid;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A reason is required'; end if;
  select id into v_referrer from public.profiles where upper(trim(referral_code)) = upper(trim(p_referrer_code));
  select id into v_referred from public.profiles where lower(email) = lower(trim(p_referred_email)) for update;
  if v_referrer is null or v_referred is null then raise exception 'Referrer code or referred email not found'; end if;
  if v_referrer = v_referred then raise exception 'Self-referrals are not allowed'; end if;
  if exists(select 1 from public.referrals where referred_id = v_referred) then raise exception 'This user already has a referrer'; end if;
  insert into public.referrals(referrer_id,referred_id,status) values(v_referrer,v_referred,'pending') returning id into v_id;
  update public.profiles set referred_by = v_referrer where id = v_referred;
  insert into public.referral_status_history(referral_id,referrer_id,referred_id,old_status,new_status,reason,created_by)
  values(v_id,v_referrer,v_referred,'none','pending',trim(p_reason),auth.uid());
end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_referrer uuid; v_code text := nullif(upper(trim(new.raw_user_meta_data ->> 'referral_code')), '');
begin
  if v_code is not null then
    select id into v_referrer from public.profiles where upper(trim(referral_code)) = v_code;
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

create or replace function public.valid_referral_code(p_code text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where upper(trim(referral_code)) = upper(trim(p_code)));
$$;

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
    select exists(select 1 from public.profiles where upper(trim(referral_code)) = v_code) into v_exists;
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

