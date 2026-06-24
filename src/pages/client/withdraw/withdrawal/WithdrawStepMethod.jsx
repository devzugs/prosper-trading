// src/pages/client/withdraw/WithdrawStepMethod.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Plus } from "lucide-react";

const WithdrawStepMethod = ({ methods, onSelectMethod }) => {
  return (
    <div className="animate-[fade-up_0.4s_ease_forwards]">
      <p className="text-sm text-text-muted mb-5">
        Where would you like to receive your funds?
      </p>

      <div className="flex flex-col gap-3">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMethod(m)}
              className="w-full flex items-center gap-4 bg-surface-alt border border-border hover:border-accent/40 rounded-xl p-5 text-left group my-transition hover:shadow-lg"
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${m.bg} group-hover:scale-105 my-transition`}>
                <Icon size={22} className={m.accent} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-heading text-base">{m.label}</p>
                <p className="text-sm text-text-muted mt-0.5">{m.detail}</p>
                <p className="text-xs text-text-muted mt-1">Est. arrival: {m.eta}</p>
              </div>

              <ChevronRight size={18} className="shrink-0 text-text-muted group-hover:text-accent my-transition" />
            </button>
          );
        })}

        <Link
          to="/payment-details"
          className="w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-accent/40 rounded-xl p-5 text-sm font-medium text-text-muted hover:text-accent my-transition"
        >
          <Plus size={15} />
          Add a new payment method
        </Link>
      </div>

      <div className="mt-6 flex items-start gap-3 bg-surface-alt border border-border rounded-xl p-4">
        <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Withdrawals are reviewed for security purposes and may be subject to verification before funds are released.
        </p>
      </div>
    </div>
  );
};

export default WithdrawStepMethod;