import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Coins from "./Coins";

const StepCoin = ({ activeMethod, onBack, onSelectCoin }) => {
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
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${activeMethod.bg}`}>
                    {React.createElement(activeMethod.icon, { size: 13, className: activeMethod.accent })}
                    <span className={`text-xs font-semibold ${activeMethod.accent}`}>{activeMethod.label}</span>
                </div>
            </div>

            <p className="text-sm text-text-muted mb-4">
                Which asset would you like to receive?
            </p>

            <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
                {Coins.map((coin, i) => (
                    <button
                        key={coin.id}
                        onClick={() => onSelectCoin(coin)}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface group my-transition
                            ${i < Coins.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                        <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full shrink-0" />

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-heading text-sm uppercase">{coin.symbol}</p>
                            <p className="text-xs text-text-muted">{coin.name}</p>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="text-xs text-text-muted">{coin.network}</p>
                        </div>

                        <ChevronRight size={15} className="text-text-muted group-hover:text-accent my-transition shrink-0" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StepCoin;