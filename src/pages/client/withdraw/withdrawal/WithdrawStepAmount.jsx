import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Info, Loader2 } from "lucide-react";
import { MIN_WITHDRAWAL, WITHDRAWAL_FEE_PCT } from "./withdrawData";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const WithdrawStepAmount = ({ method, onBack, onContinue }) => {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // 1. Fetch Real Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("wallets")
        .select("cached_balance")
        .eq("user_id", user.id);

      if (!error && data) {
        // Summing all wallets (e.g., USD + BTC values)
        const total = data.reduce((sum, wallet) => sum + Number(wallet.cached_balance), 0);
        setAvailableBalance(total);
      }
      setLoadingBalance(false);
    };
    fetchBalance();
  }, [user]);

  const numeric = parseFloat(value) || 0;
  const fee = numeric * (WITHDRAWAL_FEE_PCT / 100);
  const youReceive = Math.max(numeric - fee, 0);

  const handleChange = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    setValue(v);
    if (error) setError("");
  };

  const handleMax = () => {
    setValue(availableBalance.toFixed(2));
    setError("");
  };

  const handleContinue = () => {
    if (!value || numeric <= 0) return setError("Please enter an amount to withdraw.");
    if (numeric < MIN_WITHDRAWAL) return setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}.`);
    if (numeric > availableBalance) return setError("Amount exceeds your available database balance.");
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
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${method.bg}`}>
          {React.createElement(method.icon, { size: 13, className: method.accent })}
          <span className={`text-xs font-semibold ${method.accent}`}>{method.label}</span>
        </div>
      </div>

      <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-heading">Amount to withdraw</label>
          <p className="text-xs text-text-muted flex items-center gap-2">
            Available: 
            {loadingBalance ? <Loader2 size={12} className="animate-spin text-accent" /> : <span className="text-text-light font-medium">${fmt(availableBalance)}</span>}
          </p>
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg font-semibold">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            placeholder="0.00"
            disabled={loadingBalance}
            className="w-full rounded-md border border-border bg-surface px-8 py-3.5 text-xl font-bold text-heading outline-none my-transition focus:border-accent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleMax}
            disabled={loadingBalance}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 my-transition disabled:opacity-50"
          >
            MAX
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
            <AlertCircle size={13} className="text-danger shrink-0 mt-0.5" />
            <p className="text-xs text-text-light">{error}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={loadingBalance}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-secondary font-bold text-sm py-3 rounded-xl my-transition disabled:opacity-50"
      >
        Continue <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default WithdrawStepAmount;