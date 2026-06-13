import React, { useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import StepIndicator from "./StepIndicator";
import StepMethod from "./StepMethod";
import StepCoin from "./StepCoin";
import StepDeposit from "./StepDeposit";

const DepositPage = () => {
    const [step, setStep] = useState(1);
    const [activeMethod, setMethod] = useState(null);
    const [selectedCoin, setCoin] = useState(null);

    const pickMethod = (method) => {
        setMethod(method);
        setCoin(null);
        setStep(2);
    };

    const pickCoin = (coin) => {
        setCoin(coin);
        setStep(3);
    };

    const reset = () => {
        setMethod(null);
        setCoin(null);
        setStep(1);
    };

    return (
        <div className="min-h-screen">
            {/* ── Page header ── */}
            <div className="p-6 pb-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-heading">Deposit</h1>
                    <p className="text-sm text-text-muted mt-1">Add funds to your Prosper account.</p>
                </div>

                <Link
                    to="/transaction-history"
                    className="flex items-center gap-2 bg-surface-alt border border-border hover:border-accent/50 text-text-light text-sm font-medium px-4 py-2.5 rounded-lg my-transition"
                >
                    <History size={15} className="text-accent" />
                    <span className="hidden sm:inline">Deposit History</span>
                </Link>
            </div>

            {/* ── Content container ── */}
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <StepIndicator step={step} />

                    {step === 1 && <StepMethod onSelectMethod={pickMethod} />}
                    
                    {step === 2 && (
                        <StepCoin 
                            activeMethod={activeMethod} 
                            onBack={() => setStep(1)} 
                            onSelectCoin={pickCoin} 
                        />
                    )}
                    
                    {step === 3 && (
                        <StepDeposit 
                            activeMethod={activeMethod} 
                            selectedCoin={selectedCoin} 
                            onBack={() => setStep(2)} 
                            onReset={reset} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositPage;