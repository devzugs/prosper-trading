import React, { useState, useEffect } from "react";
import { ChevronRight, Loader2, Wallet } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

const fmt = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const WithdrawStepCoin = ({ onSelectCoin }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableBalances = async () => {
      if (!user) return;
      
      // Fetch only adjustment transactions to represent available withdrawal balance
      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("currency, amount")
        .eq("user_id", user.id)
        .eq("type", "adjustment");

      if (fetchError) {
        setError("Couldn't load your balances. Please try again.");
        setLoading(false);
        return;
      }

      // Group and sum the adjustments by currency
      const balances = (data || []).reduce((acc, tx) => {
        const coin = tx.currency.toUpperCase();
        acc[coin] = (acc[coin] || 0) + Number(tx.amount);
        return acc;
      }, {});

      // Format into an array and filter out 0 or negative balances
      const availableWallets = Object.entries(balances)
        .filter(([_, balance]) => balance > 0)
        .map(([currency, balance]) => ({
          currency,
          available_balance: balance
        }))
        .sort((a, b) => b.available_balance - a.available_balance);

      setWallets(availableWallets);
      setLoading(false);
    };
    
    fetchAvailableBalances();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-danger text-center py-10">{error}</p>;
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-10">
        <Wallet size={28} className="text-text-muted mx-auto mb-3" />
        <p className="text-sm text-text-muted">
          You don't have any available balance to withdraw yet.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-[fade-up_0.4s_ease_forwards]">
      <p className="text-sm text-text-muted mb-5">
        Which balance would you like to withdraw from?
      </p>

      <div className="flex flex-col gap-3">
        {wallets.map((w) => (
          <button
            key={w.currency}
            onClick={() => onSelectCoin(w)}
            className="w-full flex items-center gap-4 bg-surface-alt border border-border hover:border-accent/40 rounded-xl p-5 text-left group my-transition hover:shadow-lg"
          >
            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10 group-hover:scale-105 my-transition">
              <span className="text-xs font-bold text-accent uppercase">{w.currency}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-heading text-base uppercase">{w.currency}</p>
              <p className="text-sm text-text-muted mt-0.5">
                Available: {fmt(w.available_balance)} {w.currency}
              </p>
            </div>

            <ChevronRight size={18} className="shrink-0 text-text-muted group-hover:text-accent my-transition" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WithdrawStepCoin;