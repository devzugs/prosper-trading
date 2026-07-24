import React, { useEffect, useState, useMemo } from "react";
import {
    DollarSign,
    TrendingUp, 
    ChartColumn,
    Wallet,
    Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import useCryptoData from "../../../hooks/UseCryptoData";

const fmtUSD = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Portfolio = () => {
    const { user } = useAuth();
    
    // Fetch live crypto prices
    const { coins, loading: cryptoLoading } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana,usd-coin");

    // State for raw database rows
    const [rawDeposits, setRawDeposits] = useState([]);
    const [rawAdjustments, setRawAdjustments] = useState([]);
    const [dbLoading, setDbLoading] = useState(true);

    // 1. Fetch raw data from Supabase ONCE when the component mounts
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setDbLoading(true);

            const [
                { data: depositsData, error: depositsError },
                { data: adjustmentsData, error: adjustmentsError }
            ] = await Promise.all([
                // Fetch approved deposits for Portfolio Value
                supabase
                    .from("deposits")
                    .select("amount, coin")
                    .eq("user_id", user.id)
                    .eq("status", "approved"),
                
                // Fetch ONLY admin adjustments for Available Balance
                supabase
                    .from("transactions")
                    .select("amount, currency")
                    .eq("user_id", user.id)
                    .eq("type", "adjustment") 
            ]);

            if (depositsError) console.error("Error fetching deposits:", depositsError.message);
            if (adjustmentsError) console.error("Error fetching adjustments:", adjustmentsError.message);

            setRawDeposits(depositsData || []);
            setRawAdjustments(adjustmentsData || []);
            setDbLoading(false);
        };

        fetchData();
    }, [user]);

    // 2. Calculate live USD values (Auto-updates when crypto prices change)
    const { portfolioValue, availableBalance } = useMemo(() => {
        const getUsdValue = (amount, currencySymbol) => {
            const amt = Number(amount || 0);
            const sym = (currencySymbol || "USD").toLowerCase();
            
            // Treat USD and stablecoins as 1:1
            if (sym === "usd" || sym === "usdt") return amt;
            
            // Find the live coin price from the hook
            const liveCoin = coins?.find(c => c.symbol.toLowerCase() === sym || c.id.toLowerCase() === sym);
            
            // Multiply amount by live price. If coin isn't found, fallback to raw amount.
            return liveCoin ? amt * liveCoin.current_price : amt;
        };

        // Sum up USD value of all deposits
        const portVal = rawDeposits.reduce((sum, dep) => sum + getUsdValue(dep.amount, dep.coin), 0);
        
        // Sum up USD value of all admin adjustments
        const availBal = rawAdjustments.reduce((sum, adj) => sum + getUsdValue(adj.amount, adj.currency), 0);

        return { portfolioValue: portVal, availableBalance: availBal };
    }, [rawDeposits, rawAdjustments, coins]);

    const isLoading = dbLoading || cryptoLoading;

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
                    {isLoading ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold text-heading">{fmtUSD(portfolioValue)}</h3>
                    )}
                </div>
                {!isLoading && (
                    <p className="text-xs text-text-muted mt-1">
                        {rawDeposits.length > 0
                            ? `Across ${rawDeposits.length} approved deposit${rawDeposits.length !== 1 ? "s" : ""}`
                            : "No approved deposits yet"}
                    </p>
                )}
            </div>

            {/* 24H P&L (Placeholder) */}
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

            {/* Total Trades (Placeholder) */}
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
                        <span className="text-xs font-semibold">--</span>
                    </div>
                </div>
            </div>

            {/* Available Balance (Strictly Admin Adjustments) */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Available Balance</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <Wallet size={18} className="text-accent" />
                    </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                    {isLoading ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold text-heading">{fmtUSD(availableBalance)}</h3>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;