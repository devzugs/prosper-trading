import React from "react";
import { Search, Shield, ChartNoAxesCombined } from 'lucide-react';

const InvestmentPhilosophy = () => {
    return(
        <div className="py-16">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center font-heading font-bold">Our Investment Philosophy</h2>
                <p className="text-text-light text-center mt-3 font-medium max-w-3xl mx-auto">
                    We combine quantitative analysis with fundamental research to identify sustainable investment opportunities in the digital asset space.
                </p>
                
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="animate-pop-out [animation-delay:100ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border border-white/5 w-full mx-auto">
                        <Search className="text-accent hover:text-accent-light transition" size={50} />
                        <h3 className="text-white text-2xl font-semibold">Fundamental Research</h3>
                        <p className="text-blue-100 text-[16px] leading-relaxed">
                            Comprehensive analysis of blockchain fundamentals, team expertise, and market positioning to identify high-potential assets.
                        </p>
                    </div>

                    <div className="animate-pop-out [animation-delay:200ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border border-white/5 w-full mx-auto">
                        <Shield className="text-accent hover:text-accent-light transition" size={50} />
                        <h3 className="text-white text-2xl font-semibold">Risk Management</h3>
                        <p className="text-blue-100 text-[16px] leading-relaxed">
                            Advanced risk modeling and portfolio diversification strategies to protect capital while seeking optimal returns.
                        </p>
                    </div>

                    <div className="animate-pop-out [animation-delay:300ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border border-white/5 w-full mx-auto">
                        <ChartNoAxesCombined className="text-accent hover:text-accent-light transition" size={50} />
                        <h3 className="text-white text-2xl font-semibold">Quantitative Analysis</h3>
                        <p className="text-blue-100 text-[16px] leading-relaxed">
                            Algorithmic trading strategies and statistical models to identify market inefficiencies and capture alpha.
                        </p>
                    </div>
                </div>
            </div>    
        </div>
    )
}

export default InvestmentPhilosophy;