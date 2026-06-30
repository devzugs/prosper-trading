-- ---------------------------------------------------------------------------
-- Function: approve_deposit
-- ---------------------------------------------------------------------------
create or replace function public.approve_deposit(p_deposit_id uuid)
returns void
language plpgsql
security definer -- Executes with the privileges of the function creator (admin bypass)
as $$
declare
  v_deposit public.deposits%rowtype;
  v_caller_id uuid := auth.uid();
begin
  -- 1. Authorization: Only admins can execute this
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can approve deposits.';
  end if;

  -- 2. Lock the deposit row to prevent race conditions (double approval)
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

  -- 3. Update the deposit status and audit trail
  update public.deposits
  set 
    status = 'approved',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_deposit_id;

  -- 4. Create the immutable ledger entry (Positive Amount for Credit)
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_deposit.user_id, 'deposit', v_deposit.coin, v_deposit.amount, 'completed', 'deposits', p_deposit_id, v_caller_id
  );

  -- 5. Upsert the Wallet Cache
  -- If the wallet exists, add the amount. If not, create it.
  insert into public.wallets (user_id, currency, cached_balance)
  values (v_deposit.user_id, v_deposit.coin, v_deposit.amount)
  on conflict (user_id, currency)
  do update set 
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();

end;
$$;




-- ---------------------------------------------------------------------------
-- Function: approve_withdrawal
-- ---------------------------------------------------------------------------
create or replace function public.approve_withdrawal(p_withdrawal_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_wallet_balance numeric;
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  -- Lock withdrawal row
  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then raise exception 'Withdrawal not found.'; end if;
  if v_withdrawal.status != 'pending' then raise exception 'Withdrawal already processed.'; end if;

  -- Fetch and lock the user's wallet for this specific currency
  select cached_balance into v_wallet_balance
  from public.wallets
  where user_id = v_withdrawal.user_id and currency = v_withdrawal.currency
  for update;

  -- Null check and balance check
  if v_wallet_balance is null or v_wallet_balance < v_withdrawal.amount then
    raise exception 'Insufficient balance to approve this withdrawal.';
  end if;

  -- Update withdrawal
  update public.withdrawals
  set status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
  where id = p_withdrawal_id;

  -- Insert ledger entry (Negative Amount for Debit)
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_withdrawal.user_id, 'withdrawal', v_withdrawal.currency, -v_withdrawal.amount, 'completed', 'withdrawals', p_withdrawal_id, v_caller_id
  );

  -- Deduct from Wallet Cache
  update public.wallets
  set cached_balance = cached_balance - v_withdrawal.amount, updated_at = now()
  where user_id = v_withdrawal.user_id and currency = v_withdrawal.currency;

end;
$$;







-- ---------------------------------------------------------------------------
-- Function: adjust_balance
-- ---------------------------------------------------------------------------
create or replace function public.adjust_balance(
  p_target_user_id uuid,
  p_currency text,
  p_amount numeric, -- Can be positive or negative
  p_reason text
)
returns void
language plpgsql
security definer
as $$
declare
  v_caller_id uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'Unauthorized.'; end if;
  if p_amount = 0 then raise exception 'Adjustment amount cannot be zero.'; end if;
  if p_reason is null or trim(p_reason) = '' then raise exception 'A reason must be provided for audit purposes.'; end if;

  -- Insert ledger entry
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by, note
  ) values (
    p_target_user_id, 'adjustment', p_currency, p_amount, 'completed', null, null, v_caller_id, p_reason
  );

  -- Upsert Wallet Cache
  insert into public.wallets (user_id, currency, cached_balance)
  values (p_target_user_id, p_currency, p_amount)
  on conflict (user_id, currency)
  do update set 
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();

end;
$$;





-- ---------------------------------------------------------------------------
-- Function: credit_referral
-- ---------------------------------------------------------------------------
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

  -- Lock referral row
  select * into v_referral
  from public.referrals
  where id = p_referral_id
  for update;

  if not found then raise exception 'Referral not found.'; end if;
  -- Note: Depending on your exact logic in Phase 8, you might check if status == 'pending' here.
  
  -- Mark referral as active/paid out (adjust based on your Phase 8 design)
  update public.referrals set status = 'active' where id = p_referral_id;

  -- Insert ledger entry
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by
  ) values (
    v_referral.referrer_id, 'referral_bonus', p_currency, p_amount, 'completed', 'referrals', p_referral_id, v_caller_id
  );

  -- Upsert Wallet Cache
  insert into public.wallets (user_id, currency, cached_balance)
  values (v_referral.referrer_id, p_currency, p_amount)
  on conflict (user_id, currency)
  do update set 
    cached_balance = public.wallets.cached_balance + excluded.cached_balance,
    updated_at = now();

end;
$$;