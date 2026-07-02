import React, { useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getMinWithdrawal, WITHDRAWAL_FEE_PCT } from "./withdrawData";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });

// The available balance for this step comes from the wallet the user just
// picked in WithdrawStepCoin (coin.cached_balance) — no need to re-fetch it
// here, and no assumption that the currency is USD. `coin.currency` is
// whatever the user is withdrawing (e.g. "Bitcoin", "USD", "Tether") and
// must match the exact string stored in wallets.currency, since that's what
// determines both the minimum withdrawal here and the balance check the
// server runs later in approve_withdrawal.
const WithdrawStepAmount = ({ coin, method, onBack, onContinue }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const availableBalance = Number(coin?.cached_balance ?? 0);
  const currency = coin?.currency ?? "";
  const minWithdrawal = getMinWithdrawal(currency);

  const numeric = parseFloat(value) || 0;
  const fee = numeric * (WITHDRAWAL_FEE_PCT / 100);
  const youReceive = Math.max(numeric - fee, 0);

  const handleChange = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    setValue(v);
    if (error) setError("");
  };

  const handleMax = () => {
    setValue(String(availableBalance));
    setError("");
  };

  const handleContinue = () => {
    if (!value || numeric <= 0) return setError("Please enter an amount to withdraw.");
    if (numeric < minWithdrawal) return setError(`Minimum withdrawal is ${fmt(minWithdrawal)} ${currency}.`);
    if (numeric > availableBalance) return setError(`Amount exceeds your available ${currency} balance.`);
    onContinue(numeric);
  };

  return (
    <div className="animate-[fade-up_0.4s_ease_forwards]">
      {/* Header section... */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent my-transition">
          <ChevronLeft size={15} /> Back
        </button>
        <span className="text-border">|</span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10">
          <span className="text-xs font-semibold text-accent">{currency}</span>
        </div>
        {method && (
          <>
            <span className="text-border">|</span>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${method.bg}`}>
              {method.icon && React.createElement(method.icon, { size: 13, className: method.accent })}
              <span className={`text-xs font-semibold ${method.accent}`}>{method.label}</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-heading">Amount to withdraw</label>
          <p className="text-xs text-text-muted flex items-center gap-2">
            Available:{" "}
            <span className="text-text-light font-medium">{fmt(availableBalance)} {currency}</span>
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full rounded-md border border-border bg-surface px-4 py-3.5 text-xl font-bold text-heading outline-none my-transition focus:border-accent"
          />
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">
            {currency}
          </span>
          <button
            type="button"
            onClick={handleMax}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 my-transition"
          >
            MAX
          </button>
        </div>

        <p className="text-xs text-text-muted mt-2">
          Minimum withdrawal: {fmt(minWithdrawal)} {currency}
        </p>

        {numeric > 0 && (
          <p className="text-xs text-text-muted mt-1">
            Fee ({WITHDRAWAL_FEE_PCT}%): {fmt(fee)} {currency} — you'll receive {fmt(youReceive)} {currency}
          </p>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
            <AlertCircle size={13} className="text-danger shrink-0 mt-0.5" />
            <p className="text-xs text-text-light">{error}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-secondary font-bold text-sm py-3 rounded-xl my-transition"
      >
        Continue <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default WithdrawStepAmount;