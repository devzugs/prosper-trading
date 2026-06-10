import React from "react";
import {
    DollarSign,
    TrendingUp, 
    ChartColumn,
    Wallet,
} from "lucide-react";

const Portfolio = () => {
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
                    <h3 className="text-2xl sm:text-3xl font-bold text-heading">$0.00</h3>
                    <div className="flex items-center gap-0.5 text-success">
                        <TrendingUp size={14} />
                        <span className="text-xs font-semibold">+0%</span>
                    </div>
                </div>
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

            {/* Cash Balance */}
            <div className="bg-surface rounded-lg border border-border p-4 hover:border-accent/40 my-transition">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-text-light mt-1">Cash Balance</p>
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