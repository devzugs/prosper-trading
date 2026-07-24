import React, { useEffect, useState } from "react";
import Portfolio from "./dashboard/Portfolio";
import LiveMarket from "./dashboard/LiveMarket";
import QuickLinks from "./dashboard/QuickLinks";
import TradingChart from "./dashboard/TradingCharts";
import PortfolioPerformance from "./dashboard/PortfolioPerformance";
import TransactionHistoryWidget from "./transactions/TransactionHistoryWidget";
import DashboardGreeting from "./dashboard/DashboardGreeting";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [transactionCount, setTransactionCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchRecentTransactions = async () => {
            const [txRes, txCountRes, depRes, withRes] = await Promise.all([
                // 1. Fetch recent completed transactions
                supabase
                    .from("transactions")
                    .select("id, type, currency, amount, status, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(10), // Fetch 10 to ensure accurate sorting when merged
                // 2. Fetch total count of completed ledger transactions
                supabase
                    .from("transactions")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", user.id),
                // 3. Fetch pending deposits
                supabase
                    .from("deposits")
                    .select("id, coin, amount, status, created_at")
                    .eq("user_id", user.id)
                    .eq("status", "pending"),
                // 4. Fetch pending withdrawals
                supabase
                    .from("withdrawals")
                    .select("id, currency, amount, status, created_at")
                    .eq("user_id", user.id)
                    .eq("status", "pending")
            ]);

            if (txRes.error || txCountRes.error || depRes.error || withRes.error) {
                console.error("Error fetching recent transactions");
                return;
            }

            // Normalize pending deposits
            const pendingDeposits = (depRes.data || []).map(d => ({
                id: d.id,
                type: "deposit",
                currency: d.coin, 
                amount: d.amount,
                status: d.status,
                created_at: d.created_at
            }));

            // Normalize pending withdrawals
            const pendingWithdrawals = (withRes.data || []).map(w => ({
                id: w.id,
                type: "withdrawal",
                currency: w.currency,
                amount: -Math.abs(w.amount), // Ledger uses negative amounts for withdrawals
                status: w.status,
                created_at: w.created_at
            }));

            // Merge everything and sort newest-first
            const allTransactions = [...(txRes.data || []), ...pendingDeposits, ...pendingWithdrawals];
            allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            // Pass only the top 4 most recent to the widget state
            setRecentTransactions(allTransactions.slice(0, 4));

            // Calculate true total count (ledger count + pending items)
            const ledgerCount = txCountRes.count || 0;
            setTransactionCount(ledgerCount + pendingDeposits.length + pendingWithdrawals.length);
        };

        fetchRecentTransactions();
    }, [user]);

    return (
        <>
            {/* Replace the hardcoded layout with our new component */}
            <DashboardGreeting />
            
            <Portfolio />
            <QuickLinks />
            <PortfolioPerformance />
            <LiveMarket />
            <TransactionHistoryWidget transactions={recentTransactions} totalCount={transactionCount} />
        </>
    )
}

export default Dashboard;