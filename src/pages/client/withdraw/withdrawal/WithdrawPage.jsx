// src/pages/client/withdraw/WithdrawPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import WithdrawStepIndicator from "./WithdrawStepIndicator";
import WithdrawStepMethod from "./WithdrawStepMethod";
import WithdrawStepAmount from "./WithdrawStepAmount";
import WithdrawStepReview from "./WithdrawStepReview";
import { SAVED_METHODS } from "./withdrawData";

const WithdrawPage = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState(0);

  const pickMethod = (m) => {
    setMethod(m);
    setStep(2);
  };

  const confirmAmount = (amt) => {
    setAmount(amt);
    setStep(3);
  };

  const reset = () => {
    setMethod(null);
    setAmount(0);
    setStep(1);
  };

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="p-6 pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Withdraw</h1>
          <p className="text-sm text-text-muted mt-1">Move funds from Prosper to your own account.</p>
        </div>

        <Link
          to="/transaction-history"
          className="flex items-center gap-2 bg-surface-alt border border-border hover:border-accent/50 text-text-light text-sm font-medium px-4 py-2.5 rounded-lg my-transition"
        >
          <History size={15} className="text-accent" />
          <span className="hidden sm:inline">Withdrawal History</span>
        </Link>
      </div>

      {/* ── Content container ── */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <WithdrawStepIndicator step={step} />

          {step === 1 && (
            <WithdrawStepMethod methods={SAVED_METHODS} onSelectMethod={pickMethod} />
          )}

          {step === 2 && (
            <WithdrawStepAmount
              method={method}
              onBack={() => setStep(1)}
              onContinue={confirmAmount}
            />
          )}

          {step === 3 && (
            <WithdrawStepReview
              method={method}
              amount={amount}
              onBack={() => setStep(2)}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;