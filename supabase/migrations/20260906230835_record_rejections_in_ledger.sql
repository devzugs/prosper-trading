-- ---------------------------------------------------------------------------
-- Function: reject_withdrawal (Updated to log 'reversed' transaction)
-- ---------------------------------------------------------------------------
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

  if not found then raise exception 'Withdrawal record not found.'; end if;
  if v_withdrawal.status != 'pending' then raise exception 'Withdrawal is already processed.'; end if;

  -- 1. Update the withdrawal status
  update public.withdrawals
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_withdrawal_id;

  -- 2. Insert ledger entry as 'reversed' so it appears in history
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by, note
  ) values (
    v_withdrawal.user_id, 'withdrawal', v_withdrawal.currency, -v_withdrawal.amount, 'reversed', 'withdrawals', p_withdrawal_id, v_caller_id, 'Rejected by admin'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Function: reject_deposit (Updated to log 'reversed' transaction)
-- ---------------------------------------------------------------------------
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

  if not found then raise exception 'Deposit record not found.'; end if;
  if v_deposit.status != 'pending' then raise exception 'Deposit is already processed.'; end if;

  -- 1. Update the deposit status
  update public.deposits
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_deposit_id;

  -- 2. Insert ledger entry as 'reversed' so it appears in history
  insert into public.transactions (
    user_id, type, currency, amount, status, reference_table, reference_id, created_by, note
  ) values (
    v_deposit.user_id, 'deposit', v_deposit.coin, v_deposit.amount, 'reversed', 'deposits', p_deposit_id, v_caller_id, 'Rejected by admin'
  );
end;
$$;

