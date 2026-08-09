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
import { calculateTotalROI, calculateTotalDaysActive } from "../../../lib/roiCalculator";

const fmtUSD = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Portfolio = () => {
    const { user } = useAuth();
    
    // Fetch live crypto prices
    const { coins, loading: cryptoLoading } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana,usd-coin");

    // State for raw database rows & profile details
    const [rawDeposits, setRawDeposits] = useState([]);
    const [rawAdjustments, setRawAdjustments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [dbLoading, setDbLoading] = useState(true);

    // 1. Fetch raw data from Supabase ONCE when the component mounts
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setDbLoading(true);

            const [
                { data: profileData, error: profileError },
                { data: depositsData, error: depositsError },
                { data: adjustmentsData, error: adjustmentsError }
            ] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("active_plan, plan_start_date, accumulated_roi, accumulated_days")
                    .eq("id", user.id)
                    .single(),

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

            if (profileError) console.error("Error fetching profile plan:", profileError.message);
            if (depositsError) console.error("Error fetching deposits:", depositsError.message);
            if (adjustmentsError) console.error("Error fetching adjustments:", adjustmentsError.message);

            setProfile(profileData || null);
            setRawDeposits(depositsData || []);
            setRawAdjustments(adjustmentsData || []);
            setDbLoading(false);
        };

        fetchData();
    }, [user]);

    // 2. Calculate live USD values (Auto-updates when crypto prices change)
    const { portfolioValue, availableBalance, totalROI, totalTrades } = useMemo(() => {
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

        // 1. Calculate base deposit value
        const baseDepositValue = rawDeposits.reduce((sum, dep) => sum + getUsdValue(dep.amount, dep.coin), 0);
        
        // 2. Extract plan details and historical data safely from profile state
        const plan = profile?.active_plan; 
        const startDate = profile?.plan_start_date;
        const pastROI = profile?.accumulated_roi || 0;

        const pastDays = profile?.accumulated_days || 0; 

        // 3. Calculate dynamic ROI (Current active ROI + Historical ROI)
        const calculatedROI = calculateTotalROI(baseDepositValue, plan, startDate, pastROI);
        
        const calculatedTrades = calculateTotalDaysActive(startDate, pastDays);

        // 4. Total Portfolio Value = Base Deposits + Accrued ROI
        const portVal = baseDepositValue + calculatedROI;

        // 5. Sum up admin adjustments for Available Balance
        const availBal = rawAdjustments.reduce((sum, adj) => sum + getUsdValue(adj.amount, adj.currency), 0);

        return { 
        portfolioValue: portVal, 
        availableBalance: availBal, 
        totalROI: calculatedROI, 
        totalTrades: calculatedTrades 
    };
    }, [rawDeposits, rawAdjustments, coins, profile]);

    const isLoading = dbLoading || cryptoLoading;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            {/* Portfolio Value */}
            <div className="bg-surface-alt rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Portfolio Balance</p>
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
                        {profile?.active_plan 
                            ? `Active Plan: ${profile.active_plan.toUpperCase()}`
                            : rawDeposits.length > 0
                                ? `Across ${rawDeposits.length} approved deposit${rawDeposits.length !== 1 ? "s" : ""}`
                                : "No active investment plan"}
                    </p>
                )}
            </div>

            {/* Total Accrued ROI */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Total Profit (ROI)</p>
                    <span className="bg-accent/10 p-1.5 rounded-md">
                        <TrendingUp size={18} className="text-accent" />
                    </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                    {isLoading ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold text-success">+{fmtUSD(totalROI)}</h3>
                    )}
                </div>
                {!isLoading && (
                    <p className="text-xs text-text-muted mt-1">
                        {profile?.active_plan ? "Accruing daily ROI" : "No plan selected"}
                    </p>
                )}
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
                    {isLoading ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold text-heading">{totalTrades}</h3>
                    )}
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