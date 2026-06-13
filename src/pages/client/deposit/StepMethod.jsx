import React from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import DepositMethods from "./DepositMethods";

const StepMethod = ({ onSelectMethod }) => {
    return (
        <div className="animate-[fade-up_0.4s_ease_forwards]">
            <p className="text-sm text-text-muted mb-5">
                How would you like to deposit funds?
            </p>

            <div className="flex flex-col gap-3">
                {DepositMethods.map((m) => {
                    const Icon = m.icon;
                    return (
                        <button
                            key={m.id}
                            onClick={() => onSelectMethod(m)}
                            className={`w-full flex items-center gap-4 bg-surface-alt border border-border ${m.border} rounded-xl p-5 text-left group my-transition hover:shadow-lg`}
                        >
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${m.bg} group-hover:scale-105 my-transition`}>
                                <Icon size={22} className={m.accent} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-heading text-base">{m.label}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.tagColor}`}>
                                        {m.tag}
                                    </span>
                                </div>
                                <p className="text-sm text-text-muted mt-0.5 leading-relaxed">{m.subtext}</p>
                            </div>

                            <ChevronRight size={18} className="shrink-0 text-text-muted group-hover:text-accent my-transition" />
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-start gap-3 bg-surface-alt border border-border rounded-xl p-4">
                <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    All deposits are secured with 256-bit encryption. External payments are processed by regulated third-party providers.
                </p>
            </div>
        </div>
    );
};

export default StepMethod;