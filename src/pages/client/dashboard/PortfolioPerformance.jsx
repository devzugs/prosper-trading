import React from "react";
import TradingChart from "./TradingCharts";
import Holdings from "./Holdings";

const PortfolioPerformance = () => {
    return(
        <>
            <h2 className="text-2xl font-bold text-text-light mb-4 p-6">
                Portfolio Performance
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                <div className="lg:col-span-3 rounded-xl ">
                    <div className="h-100 w-full">
                        <TradingChart 
                            colors={{
                            backgroundColor: '#051427',
                            lineColor: '#10b981', // Tailwind Emerald-500
                            textColor: '#374151', // Tailwind Gray-700
                            areaTopColor: 'rgba(16, 185, 129, 0.4)',
                            areaBottomColor: 'rgba(16, 185, 129, 0.0)',
                            }} 
                        />
                    </div>
                </div>
                <div className="lg:col-span-2 rounded-xl ">
                        {/* Side component */}
                        <Holdings />
                </div>
            </div>
        </>  
    )
}

export default PortfolioPerformance;