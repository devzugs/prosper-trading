import React from "react";
import {
    DollarSign,
    TrendingUp, 
    ChartColumn,
    Wallet,

}from "lucide-react";

const Portfolio = () => {
    return (
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">

                {/* Portfolio Value */}
                <div className="bg-surface-alt rounded-lg border border-border shadow-md p-4 hover:border-accent/40 my-transition">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-text-light">Portfolio Value</p>

                        <span className="bg-accent/20 p-2 rounded-md">
                            <DollarSign
                                size={20}
                                className="text-accent"
                            />
                        </span>
                    </div>

                    <h3 className="text-3xl font-bold">$0.00</h3>

                    <div className="flex items-center gap-1 mt-3 text-success">
                        <TrendingUp size={15} />
                        <span className="text-xs font-medium">+0%</span>
                    </div>
                </div>

                {/* 24H P&L */}
                <div className="bg-surface rounded-lg border border-border shadow-md p-4 hover:border-accent/40 my-transition">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-text-light">24H P&L</p>

                        <span className="bg-accent/20 p-2 rounded-md">
                            <TrendingUp
                                size={20}
                                className="text-accent"
                            />
                        </span>
                    </div>

                    <h3 className="text-3xl font-bold text-success">
                        +$0.00
                    </h3>

                    <div className="flex items-center gap-1 mt-3 text-success">
                        <TrendingUp size={15} />
                        <span className="text-xs font-medium">+0%</span>
                    </div>
                </div>

                {/* Total Trades */}
                <div className="bg-surface rounded-lg border border-border shadow-md p-4 hover:border-accent/40 my-transition">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-text-light">Total Trades</p>

                        <span className="bg-accent/20 p-2 rounded-md">
                            <ChartColumn
                                size={20}
                                className="text-accent"
                            />
                        </span>
                    </div>

                    <h3 className="text-3xl font-bold">0</h3>

                    <div className="flex items-center gap-1 mt-3 text-success">
                        <TrendingUp size={15} />
                        <span className="text-xs font-medium">+0%</span>
                    </div>
                </div>

                {/* Cash Balance */}
                <div className="bg-surface rounded-lg border border-border shadow-md p-4 hover:border-accent/40 my-transition">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-text-light">Cash Balance</p>

                        <span className="bg-accent/20 p-2 rounded-md">
                            <Wallet
                                size={20}
                                className="text-accent"
                            />
                        </span>
                    </div>

                    <h3 className="text-3xl font-bold">$0.00</h3>

                    <div className="flex items-center gap-1 mt-3 text-success">
                        <TrendingUp size={15} />
                        <span className="text-xs font-medium">+0%</span>
                    </div>
                </div>

            </div>
    )
}

export default Portfolio;