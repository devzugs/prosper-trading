// src/pages/client/withdraw/WithdrawStepIndicator.jsx
import React from "react";
import { CheckCheck } from "lucide-react";

const StepDot = ({ n, active, done }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold my-transition border
      ${done ? "bg-accent border-accent text-secondary" : ""}
      ${active && !done ? "bg-accent/10 border-accent text-accent" : ""}
      ${!active && !done ? "bg-surface-alt border-border text-text-muted" : ""}
  `}>
    {done ? <CheckCheck size={13} /> : n}
  </div>
);

const WithdrawStepIndicator = ({ step }) => {
  const steps = ["Coin", "Method", "Amount", "Review"];

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <StepDot n={i + 1} active={step === i + 1} done={step > i + 1} />
            <span className={`text-[10px] font-medium my-transition ${step === i + 1 ? "text-accent" : step > i + 1 ? "text-text-light" : "text-text-muted"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mb-4 my-transition ${step > i + 1 ? "bg-accent/50" : "bg-border"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WithdrawStepIndicator;