import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Info, ShieldCheck, ExternalLink, X } from "lucide-react";
import CopyBtn from "./CopyBtn";
import ProviderButtons from "./ProviderButtons";

const StepDeposit = ({ activeMethod, selectedCoin, onBack, onReset }) => {
    const [logoErrors, setLogoErrors] = useState({});
    const providerCfg = activeMethod?.provider ? ProviderButtons[activeMethod.provider] : null;

    if (!selectedCoin) return null;

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
                <ChevronRight size={12} className="text-text-muted" />
                <div className="flex items-center gap-1.5">
                    <img src={selectedCoin.image} alt={selectedCoin.name} className="w-4 h-4 rounded-full" />
                    <span className="text-xs font-semibold text-text-light uppercase">{selectedCoin.symbol}</span>
                </div>
            </div>

            <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                    <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <h2 className="text-lg font-bold text-heading uppercase">{selectedCoin.symbol}</h2>
                        <p className="text-sm text-text-muted">{selectedCoin.name}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-text-muted">Network</p>
                        <p className="text-sm font-medium text-text-light mt-0.5">{selectedCoin.network}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                        <Info size={11} className="text-accent" />
                        <span className="text-xs text-text-muted">Min. deposit:</span>
                        <span className="text-xs font-semibold text-heading">{selectedCoin.minDeposit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                        <ShieldCheck size={11} className="text-success" />
                        <span className="text-xs text-text-muted">Confirmations:</span>
                        <span className="text-xs font-semibold text-heading">{selectedCoin.confirmations}</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-heading">Your {selectedCoin.symbol} Deposit Address</p>
                    <CopyBtn text={selectedCoin.address} />
                </div>

                <div className="bg-secondary border border-border rounded-lg px-4 py-3 flex items-center gap-3 overflow-hidden">
                    <code className="text-xs text-accent font-mono flex-1 break-all leading-relaxed">
                        {selectedCoin.address}
                    </code>
                </div>

                <div className="mt-3 flex items-start gap-2">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                    <p className="text-xs text-text-muted leading-relaxed">
                        Only send <span className="font-semibold text-text-light">{selectedCoin.symbol}</span> on the{" "}
                        <span className="font-semibold text-text-light">{selectedCoin.network}</span> to this address.
                        Sending any other asset will result in permanent loss.
                    </p>
                </div>
            </div>

            {providerCfg && (
                <div className="bg-surface-alt rounded-xl border border-border p-5 mb-4">
                    <p className="text-sm font-semibold text-heading mb-1">
                        Pay via {activeMethod.label}
                    </p>
                    <p className="text-xs text-text-muted mb-4 leading-relaxed">
                        {providerCfg.description}
                    </p>
                    <a
                        href={providerCfg.href(selectedCoin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-secondary font-semibold text-sm py-3 rounded-xl my-transition"
                    >
                        {!logoErrors[activeMethod.provider] ? (
                            <img
                                src={providerCfg.logo}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                                onError={() => setLogoErrors(prev => ({ ...prev, [activeMethod.provider]: true }))}
                            />
                        ) : (
                            <span className="text-[10px] font-bold">{providerCfg.fallbackLabel}</span>
                        )}
                        {providerCfg.label}
                        <ExternalLink size={13} />
                    </a>
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 bg-surface-alt border border-border hover:border-accent/40 text-text-muted hover:text-text-light text-sm font-medium py-3 rounded-xl my-transition"
            >
                <X size={14} />
                Start over
            </button>
        </div>
    );
};

export default StepDeposit;