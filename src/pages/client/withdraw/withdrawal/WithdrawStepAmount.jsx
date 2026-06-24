// src/pages/client/withdraw/WithdrawStepAmount.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Info } from "lucide-react";
import { AVAILABLE_BALANCE, MIN_WITHDRAWAL, WITHDRAWAL_FEE_PCT } from "./withdrawData";

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const WithdrawStepAmount = ({ method, onBack, onContinue }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const numeric = parseFloat(value) || 0;
  const fee = numeric * (WITHDRAWAL_FEE_PCT / 100);
  const youReceive = Math.max(numeric - fee, 0);

  const handleChange = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    setValue(v);
    if (error) setError("");
  };

  const handleMax = () => {
    setValue(AVAILABLE_BALANCE.toFixed(2));
    setError("");
  };

  const handleContinue = () => {
    if (!value || numeric <= 0) {
      setError("Please enter an amount to withdraw.");
      return;
    }
    if (numeric < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (numeric > AVAILABLE_BALANCE) {
      setError("Amount exceeds your available balance.");
      return;
    }
    onContinue(numeric);
  };

  return (
    <div className="animate-[fade-up_0.4s_ease_forwards]">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent my-transition"
        >
          <ChevronLeft size={15} />
          Back
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
          <p className="text-xs text-text-muted">
            Available: <span className="text-text-light font-medium">${fmt(AVAILABLE_BALANCE)}</span>
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
            className="w-full rounded-md border border-border bg-surface px-8 py-3.5 text-xl font-bold text-heading outline-none my-transition focus:border-accent placeholder:text-text-muted/40"
          />
          <button
            type="button"
            onClick={handleMax}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 my-transition"
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

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
            <Info size={11} className="text-accent" />
            <span className="text-xs text-text-muted">Min. withdrawal:</span>
            <span className="text-xs font-semibold text-heading">${MIN_WITHDRAWAL}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
            <Info size={11} className="text-accent" />
            <span className="text-xs text-text-muted">Processing fee:</span>
            <span className="text-xs font-semibold text-heading">{WITHDRAWAL_FEE_PCT}%</span>
          </div>
        </div>
      </div>

      {numeric > 0 && (
        <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Withdrawal amount</span>
            <span className="text-text-light font-medium">${fmt(numeric)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Fee ({WITHDRAWAL_FEE_PCT}%)</span>
            <span className="text-danger font-medium">-${fmt(fee)}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/60">
            <span className="text-heading font-semibold">You'll receive</span>
            <span className="text-success font-bold">${fmt(youReceive)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-secondary font-bold text-sm py-3 rounded-xl my-transition"
      >
        Continue
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default WithdrawStepAmount;