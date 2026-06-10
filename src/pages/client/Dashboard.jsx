import React from "react";
import Portfolio from "./dashboard/portfolio";
import LiveMarket from "./dashboard/LiveMarket";
import QuickLinks from "./dashboard/QuickLinks";
import TradingChart from "./dashboard/TradingCharts";
import PortfolioPerformance from "./dashboard/PortfolioPerformance";
const Dashboard = () => {
    return (
        <>
            <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-heading">
                    Good Morning, Jay
                </h1>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    <span>Live data</span>
                </div>
            </div>
            <Portfolio />
            <PortfolioPerformance />
            <QuickLinks />
            <LiveMarket />
            
        </>
    )
}

export default Dashboard;