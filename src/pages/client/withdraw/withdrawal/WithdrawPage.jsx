import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History, Bitcoin, Landmark, CreditCard, Loader2 } from "lucide-react";
import WithdrawStepIndicator from "./WithdrawStepIndicator";
import WithdrawStepMethod from "./WithdrawStepMethod";
import WithdrawStepAmount from "./WithdrawStepAmount";
import WithdrawStepReview from "./WithdrawStepReview";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

const WithdrawPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState(0);
  const [savedMethods, setSavedMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch saved methods from DB
  useEffect(() => {
    if (!user) return;
    const fetchMethods = async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map DB types to UI styling and extract display details
        const formatted = data.map((m) => {
          let icon, bg, accent, eta, detail;
          
          if (m.method === 'crypto') {
            icon = Bitcoin; bg = "bg-orange-500/10"; accent = "text-orange-500"; eta = "< 1 hour";
            detail = `Network: ${m.details.network} | ${m.details.walletAddress?.slice(0, 6)}...${m.details.walletAddress?.slice(-4)}`;
          } else if (m.method === 'wire') {
            icon = Landmark; bg = "bg-blue-500/10"; accent = "text-blue-500"; eta = "2-5 business days";
            detail = `Bank: ${m.details.bankName} | Acct: ...${m.details.accountNumber?.slice(-4)}`;
          } else {
            icon = CreditCard; bg = "bg-purple-500/10"; accent = "text-purple-500"; eta = "1-3 business days";
            detail = `Card: ...${m.details.cardNumber?.slice(-4)}`;
          }

          return { ...m, icon, bg, accent, eta, detail };
        });
        setSavedMethods(formatted);
      }
      setLoading(false);
    };

    fetchMethods();
  }, [user]);

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
      <div className="p-6 pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Withdraw</h1>
          <p className="text-sm text-text-muted mt-1">Move funds from Prosper to your own account.</p>
        </div>
        <Link to="/transaction-history" className="flex items-center gap-2 bg-surface-alt border border-border hover:border-accent/50 text-text-light text-sm font-medium px-4 py-2.5 rounded-lg my-transition">
          <History size={15} className="text-accent" />
          <span className="hidden sm:inline">Withdrawal History</span>
        </Link>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <WithdrawStepIndicator step={step} />

          {step === 1 && (
            loading ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-accent" /></div>
            ) : (
              <WithdrawStepMethod methods={savedMethods} onSelectMethod={pickMethod} />
            )
          )}

          {step === 2 && <WithdrawStepAmount method={method} onBack={() => setStep(1)} onContinue={confirmAmount} />}
          {step === 3 && <WithdrawStepReview method={method} amount={amount} onBack={() => setStep(2)} onReset={reset} />}
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;