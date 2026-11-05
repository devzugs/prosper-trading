# Referral workflow

The database migration `20261105120000_referral_workflow.sql` is the source of truth for the referral dashboard.

1. A valid `/signup?ref=CODE` signup creates one pending referral. The total count increases automatically.
2. In **Admin → Referrals → Manage**, activate the referral with a reason. Active counts determine the tier: 0–4 = 10%, 5–14 = 20%, 15–29 = 30%, 30+ = 40%.
3. Approve the referred user's deposit through the existing deposit approval workflow.
4. Select that deposit in the referral management dialog and credit it. The database calculates the amount using the current tier and credits the matching currency wallet atomically. A deposit can be credited only once, including after reversal.
5. Reverse an incorrect deposit-linked commission with a reason. Reversal requires sufficient wallet funds after pending withdrawal reservations. The original credit and reversal remain in history. Existing manual credits remain in totals but cannot be reversed through this new deposit-linked control.

Admins can attach an existing account with no referrer using **Add missing referral**. Incorrect relationships can be removed only when they have no financial history. Removal clears profile attribution and preserves an audit record. Mark paid relationships inactive instead.

## Card definitions

- **Total referrals:** all current referral relationships, including pending and inactive.
- **Active referrals:** records explicitly marked active by an admin.
- **Total referral earnings:** completed referral credits less completed referral reversals, grouped by currency.
- **Available referral earnings:** the unspent portion of credited referral earnings. Wallet debits consume referral earnings first, never below zero; pending withdrawals reserve funds. The result is capped by the actual wallet balance. Rejected withdrawals release the reservation. This is a reporting allocation within the shared wallet, not a separate withdrawal account.

Client cards refresh every 15 seconds, on window focus, and on manual refresh. Totals are calculated across all records; the client list is paginated in groups of 25. Profile access remains restricted; the dashboard RPC exposes only referral names and relevant plan/deposit summaries to their referrer.

Existing manual commissions do not identify an originating deposit. Review their transaction history before crediting historical deposits to avoid paying an already manually rewarded deposit again.

## Verification

Run `supabase db query --linked --file supabase/tests/referral_workflow.sql` after applying migrations. The test uses the existing admin only as an authorization context, creates isolated fixture accounts, and rolls back everything. It covers attribution, status changes, 4/5, 14/15 and 29/30 tier boundaries, exactly-once credits, currency separation, wallet reservations, reversals, record corrections, pagination, and authenticated access restrictions.
