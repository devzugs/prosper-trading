import React from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import ProviderButtons from "./ProviderButtons";
import CopyBtn from "./CopyBtn";

const StepPayment = ({ activeMethod, selectedCoin, amount, setAmount, onBack, onNext }) => {
    const providerConfig = activeMethod.provider ? ProviderButtons[activeMethod.provider] : null;

    return (
        <div className="animate-[fade-up_0.4s_ease_forwards]">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent my-transition"
                >
                    <ChevronLeft size={15} />
                    Back
                </button>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border">
                    <span className="text-xs font-semibold text-text-light">{selectedCoin.name}</span>
                </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-text-light mb-1">Amount to Deposit</label>
                <input 
                    type="number" 
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`e.g. 0.5 ${selectedCoin.symbol}`}
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text-light focus:outline-none focus:border-accent my-transition"
                    required
                />
            </div>

            {/* Dynamic Payment Action */}
            {providerConfig ? (
                /* Card Payment via Paybis */
                <div className="bg-surface-alt border border-border rounded-xl p-5 mb-6 text-center">
                    <p className="text-sm text-text-muted mb-2">You will need to send the purchased {selectedCoin.name} to this address:</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-sm sm:text-base font-mono text-text-light break-all bg-background p-2 rounded-lg border border-border">
                            {selectedCoin.address}
                        </span>
                        <CopyBtn text={selectedCoin.address} />
                    </div>
                    <p className="text-sm text-text-muted mb-4">{providerConfig.description}</p>
                    <a 
                        href={providerConfig.href(selectedCoin)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-secondary font-semibold text-sm py-3.5 rounded-xl my-transition"
                    >
                        <img src={providerConfig.logo} alt={providerConfig.fallbackLabel} className="w-5 h-5 rounded-full" />
                        {providerConfig.label}
                        <ExternalLink size={16} />
                    </a>
                </div>
            ) : activeMethod.id === "iban" ? (
                /* IBAN Wire Transfer Details */
                <div className="bg-surface-alt border border-border rounded-xl p-5 mb-6 space-y-4">
                    <p className="text-sm text-text-muted">
                        Transfer the market value equivalent for <strong className="text-text-light">{amount || "0"} {selectedCoin.symbol}</strong> to the account below:
                    </p>
                    <div className="space-y-3 bg-background p-4 rounded-lg border border-border text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Bank Name</span>
                            <span className="font-semibold text-text-light">{activeMethod.details.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Account Name</span>
                            <span className="font-semibold text-text-light">{activeMethod.details.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-text-muted">IBAN</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-text-light">{activeMethod.details.iban}</span>
                                <CopyBtn text={activeMethod.details.iban} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-text-muted">BIC / SWIFT</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-text-light">{activeMethod.details.bicSwift}</span>
                                <CopyBtn text={activeMethod.details.bicSwift} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeMethod.id === "paypal" ? (
                /* PayPal Details */
                <div className="bg-surface-alt border border-border rounded-xl p-5 mb-6 space-y-4">
                    <p className="text-sm text-text-muted text-center">
                        Send PayPal transfer for <strong className="text-text-light">{amount || "0"} {selectedCoin.symbol}</strong>:
                    </p>
                    {activeMethod.details.note && (
                        <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg flex items-start gap-2">
                            <span className="text-xs font-medium text-warning">
                                {activeMethod.details.note}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between bg-background p-3 rounded-lg border border-border text-sm">
                        <span className="text-text-muted">PayPal Email:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-light">{activeMethod.details.email}</span>
                            <CopyBtn text={activeMethod.details.email} />
                        </div>
                    </div>
                    {activeMethod.details.paypalMe && (
                        <a 
                            href={activeMethod.details.paypalMe} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-secondary font-semibold text-sm py-3 rounded-xl my-transition"
                        >
                            Pay via PayPal.Me <ExternalLink size={15} />
                        </a>
                    )}
                </div>
            ) : (
                /* External Crypto Wallet */
                <div className="bg-surface-alt border border-border rounded-xl p-5 mb-6 text-center">
                    <p className="text-sm text-text-muted mb-2">Send your {selectedCoin.name} to the address below:</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-sm sm:text-base font-mono text-text-light break-all bg-background p-2 rounded-lg border border-border">
                            {selectedCoin.address}
                        </span>
                        <CopyBtn text={selectedCoin.address} />
                    </div>
                </div>
            )}

            {/* Proceed to Verification */}
            <button
                onClick={onNext}
                disabled={!amount || amount <= 0}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-border hover:border-accent/50 text-text-light font-semibold text-sm py-3.5 rounded-xl my-transition disabled:opacity-50"
            >
                I've made the payment <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default StepPayment;