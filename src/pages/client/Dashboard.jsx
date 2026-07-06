import React, { useEffect, useState } from "react";
import Portfolio from "./dashboard/portfolio";
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
            const [{ data, error }, { count, error: countError }] = await Promise.all([
                supabase
                    .from("transactions")
                    .select("id, type, currency, amount, status, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(4),
                supabase
                    .from("transactions")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", user.id),
            ]);

            if (error || countError) {
                console.error("Error fetching recent transactions:", error || countError);
                return;
            }
            setRecentTransactions(data || []);
            setTransactionCount(count || 0);
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