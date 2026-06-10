import React from "react";
import TradingChart from "./TradingCharts";
import Holdings from "./Holdings";

const PortfolioPerformance = () => {
    return(
        <div className="px-6 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-light mb-4 ">
                Portfolio Performance
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-15 lg:gap-6">
                <div className="lg:col-span-3 rounded-xl ">
                    <div className="lg:col-span-3 bg-surface-alt border-border rounded-xl p-1">
                        <div className="h-75 md:h-100 w-full">
                            <TradingChart 
                                colors={{
                                backgroundColor: 'transparent', 
                                lineColor: '#16A34A',
                                textColor: '#94A3B8', 
                                areaTopColor: 'rgba(22, 163, 74, 0.1)',
                                areaBottomColor: 'rgba(22, 163, 74, 0.0)',
                                }} 
                            />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 rounded-xl ">
                        {/* Side component */}
                        <Holdings />
                </div>
            </div>
        </div>  
    )
}

export default PortfolioPerformance;