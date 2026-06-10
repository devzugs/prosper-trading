import React from "react";
import { Coins, TrendingUp, Crown } from "lucide-react";

const InvestmentPlans = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center font-heading font-bold">
          Investment Plans
        </h2>

        <p className="text-text-light text-center mt-3 font-medium max-w-3xl mx-auto">
          Choose an investment strategy tailored to your financial goals and
          risk appetite. Each plan is designed to maximize growth while
          maintaining disciplined risk management.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

          {/* Starter Plan */}
          <div className="animate-pop-out [animation-delay:100ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border border-white/5">
            <Coins className="text-accent" size={50} />

            <div>
              <h3 className="text-white text-2xl font-semibold">
                Starter Plan
              </h3>
              <p className="text-accent mt-2 text-xl font-bold">
                ROI: Up to 8% Monthly
              </p>
            </div>

            <ul className="text-blue-100 space-y-3 text-[16px]">
              <li>• Minimum Investment: $500</li>
              <li>• Portfolio Diversification</li>
              <li>• Monthly Performance Reports</li>
              <li>• Capital Preservation Focus</li>
              <li>• Dedicated Support</li>
            </ul>
          </div>

          {/* Growth Plan */}
          <div className="animate-pop-out [animation-delay:200ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border-2 border-accent relative">
            <span className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-sm font-semibold">
              Popular
            </span>

            <TrendingUp className="text-accent" size={50} />

            <div>
              <h3 className="text-white text-2xl font-semibold">
                Growth Plan
              </h3>
              <p className="text-accent mt-2 text-xl font-bold">
                ROI: Up to 15% Monthly
              </p>
            </div>

            <ul className="text-blue-100 space-y-3 text-[16px]">
              <li>• Minimum Investment: $5,000</li>
              <li>• Advanced Portfolio Allocation</li>
              <li>• Priority Customer Support</li>
              <li>• Weekly Performance Updates</li>
              <li>• Active Risk Management</li>
            </ul>
          </div>

          {/* Elite Plan */}
          <div className="animate-pop-out [animation-delay:300ms] bg-primary p-8 flex flex-col h-full gap-6 rounded-xl border border-white/5">
            <Crown className="text-accent" size={50} />

            <div>
              <h3 className="text-white text-2xl font-semibold">
                Elite Plan
              </h3>
              <p className="text-accent mt-2 text-xl font-bold">
                ROI: Up to 25% Monthly
              </p>
            </div>

            <ul className="text-blue-100 space-y-3 text-[16px]">
              <li>• Minimum Investment: $20,000</li>
              <li>• Exclusive Investment Opportunities</li>
              <li>• Personal Portfolio Manager</li>
              <li>• Daily Performance Insights</li>
              <li>• VIP Client Services</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvestmentPlans;