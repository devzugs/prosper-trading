import React, { useState } from "react";
import { ChevronLeft, ShieldCheck, X, Check, RefreshCcw } from "lucide-react";
import { WITHDRAWAL_FEE_PCT } from "./withdrawData";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const WithdrawStepReview = ({ method, amount, onBack, onReset }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const fee = amount * (WITHDRAWAL_FEE_PCT / 100);
  const youReceive = amount - fee;

const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    // method.method maps to db constraints ('crypto', 'wire', 'card')
    const { error: dbError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        method: method.method, 
        currency: 'USD', 
        amount: amount, 
        status: 'pending',
        // Capture the full raw details for the admin to execute the payment
        payment_details: { 
            target_label: method.label, 
            fee_applied: fee,
            routing_info: method.details // The actual card/wire/crypto address fields
        } 
      });

    setSubmitting(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="animate-[fade-up_0.4s_ease_forwards] flex flex-col items-center text-center py-10">
        <div className="bg-success/10 p-4 rounded-full mb-4">
          <Check size={28} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-heading mb-2">Withdrawal Requested</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">
          Your request to withdraw ${fmt(amount)} via {method.label} has been submitted and is pending admin review.
        </p>
        <button onClick={onReset} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light">
          Back to Withdrawals
        </button>
      </div>
    );
  }

  return (
    <div className="animate-[fade-up_0.4s_ease_forwards]">
      {/* Render top UI ... */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent my-transition">
          <ChevronLeft size={15} /> Back
        </button>
        <span className="text-border">|</span>
        <span className="text-xs font-semibold text-text-light">Review &amp; Confirm</span>
      </div>

      <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${method.bg}`}>
            {React.createElement(method.icon, { size: 22, className: method.accent })}
          </div>
          <div>
            <p className="font-semibold text-heading">{method.label}</p>
            <p className="text-sm text-text-muted">{method.detail}</p>
          </div>
        </div>
        {/* Render amount breakdown ... */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Withdrawal amount</span>
            <span className="text-text-light font-medium">${fmt(amount)}</span>
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
      </div>

      {error && <p className="text-sm text-danger mb-4 text-center">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-secondary font-bold text-sm py-3 rounded-xl my-transition disabled:opacity-60"
      >
        {submitting ? <><RefreshCcw size={15} className="animate-spin" /> Processing...</> : "Confirm Withdrawal"}
      </button>

      <button onClick={onReset} disabled={submitting} className="w-full mt-3 flex items-center justify-center gap-2 bg-surface-alt border border-border hover:border-accent/40 text-text-muted hover:text-text-light text-sm font-medium py-3 rounded-xl my-transition">
        <X size={14} /> Start over
      </button>
    </div>
  );
};

export default WithdrawStepReview;