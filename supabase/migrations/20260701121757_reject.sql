-- ---------------------------------------------------------------------------
-- Function: reject_withdrawal
-- ---------------------------------------------------------------------------
create or replace function public.reject_withdrawal(p_withdrawal_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_caller_id uuid := auth.uid();
begin
  -- 1. Authorization: Only admins can execute this
  if not public.is_admin() then
    raise exception 'Unauthorized: Only admins can reject withdrawals.';
  end if;

  -- 2. Lock the withdrawal row to prevent race conditions (e.g. two admins
  --    clicking Approve and Reject on the same request at the same time)
  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal record not found.';
  end if;

  if v_withdrawal.status != 'pending' then
    raise exception 'Withdrawal is already processed (Status: %).', v_withdrawal.status;
  end if;

  -- 3. Update the withdrawal status and audit trail. No wallet/ledger
  --    changes — see comment above.
  update public.withdrawals
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_withdrawal_id;

end;
$$;


-- ---------------------------------------------------------------------------
-- Function: reject_deposit
-- ---------------------------------------------------------------------------
create or replace function public.reject_deposit(p_deposit_id uuid)
returns void
language plpgsql
security definer
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

  if not found then
    raise exception 'Deposit record not found.';
  end if;

  if v_deposit.status != 'pending' then
    raise exception 'Deposit is already processed (Status: %).', v_deposit.status;
  end if;

  -- No wallet/ledger changes — a rejected deposit was never credited.
  update public.deposits
  set
    status = 'rejected',
    reviewed_by = v_caller_id,
    reviewed_at = now()
  where id = p_deposit_id;

end;
$$;