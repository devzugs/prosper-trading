import React, { useEffect, useState } from "react";
import {
    DollarSign,
    TrendingUp, 
    ChartColumn,
    Wallet,
    Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const fmtUSD = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Portfolio = () => {
    const { user } = useAuth();
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchPortfolioValue = async () => {
            setLoading(true);
            // Portfolio Value = principal currently sitting in active investment
            // plans (Starter/Growth/Elite), which is always USD per
            // investment_plans.min_investment/max_investment — no cross-currency
            // summing risk here, unlike wallets (BTC/ETH/USDT/USD).
            // ROI payouts land in the cash wallet as separate transactions and
            // aren't reflected back into this principal, so this number is
            // exactly "money currently at work", not a running total including
            // payouts already cashed out.
            const { data, error } = await supabase
                .from("user_investments")
                .select("amount")
                .eq("user_id", user.id)
                .eq("status", "active");

            if (error) {
                console.error("Error fetching portfolio value:", error.message);
            } else {
                const total = (data || []).reduce((sum, inv) => sum + Number(inv.amount), 0);
                setPortfolioValue(total);
                setActiveCount((data || []).length);
            }
            setLoading(false);
        };

        fetchPortfolioValue();
    }, [user]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">

            {/* Portfolio Value */}
            <div className="bg-surface-alt rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Portfolio Value</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <DollarSign size={18} className="text-accent" />
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                    {loading ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold text-heading">{fmtUSD(portfolioValue)}</h3>
                    )}
                </div>
                {!loading && (
                    <p className="text-xs text-text-muted mt-1">
                        {activeCount > 0
                            ? `Across ${activeCount} active plan${activeCount !== 1 ? "s" : ""}`
                            : "No active investment plans yet"}
                    </p>
                )}
            </div>

            {/* 24H P&L */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">24H P&L</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <TrendingUp size={18} className="text-accent" />
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-success">+$0.00</h3>
                    <div className="flex items-center gap-0.5 text-success">
                        <TrendingUp size={14} />
                        <span className="text-xs font-semibold">+0%</span>
                    </div>
                </div>
            </div>

            {/* Total Trades */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Total Trades</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <ChartColumn size={18} className="text-accent" />
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-heading">0</h3>
                    <div className="flex items-center gap-0.5 text-text-muted">
                        {/* Assuming a neutral state for 0 trades, you can adjust color logically later */}
                        <span className="text-xs font-semibold">--</span>
                    </div>
                </div>
            </div>

            {/* Available Balance */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Available Balance</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <Wallet size={18} className="text-accent" />
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-heading">$0.00</h3>
                    <div className="flex items-center gap-0.5 text-success">
                        <TrendingUp size={14} />
                        <span className="text-xs font-semibold">+0%</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Portfolio;