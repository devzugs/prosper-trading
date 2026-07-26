import React from "react";
import { Coins, TrendingUp, Crown, Gem } from "lucide-react";
import { Link } from "react-router-dom";

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

        <div className="mt-16  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto items-stretch">

          {/* Starter Plan */}
          <Link to="/signup">
            <div className="animate-pop-out [animation-delay:100ms] bg-primary p-6 flex flex-col h-full gap-5 rounded-xl border border-white/5">
              <Coins className="text-accent" size={40} />

              <div>
                <h3 className="text-white text-xl font-semibold">
                  Starter Plan
                </h3>
                <h5 className="bg-bronze inline text-secondary text-sm font-black px-2">
                  (BRONZE)
                </h5>
                <p className="text-accent mt-2 text-lg font-bold">
                  ROI: Up to 20% Daily
                </p>
              </div>

              <ul className="text-blue-100 space-y-2 text-[14px]">
                <li>• Minimum Investment: $200-500</li>
                <li>• Portfolio Diversification</li>
                <li>• Monthly Performance Reports</li>
                <li>• Capital Preservation Focus</li>
                <li>• Dedicated Support</li>
              </ul>
            </div>
          </Link>

          {/* Growth Plan */}
          <Link to="/signup">
            <div className="animate-pop-out [animation-delay:200ms] bg-primary p-6 flex flex-col h-full gap-5 rounded-xl border-2 border-accent relative">
              <span className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-xs font-semibold">
                Popular
              </span>

              <TrendingUp className="text-accent" size={40} />

              <div>
                <h3 className="text-white text-xl font-semibold">
                  Growth Plan
                </h3>
                <h5 className="bg-zinc-300 inline text-secondary text-sm font-black px-2">
                  (SILVER)
                </h5>
                <p className="text-accent mt-2 text-lg font-bold">
                  ROI: Up to 40% Daily
                </p>
              </div>

              <ul className="text-blue-100 space-y-2 text-[14px]">
                <li>• Minimum Investment: $1,000-$2,500</li>
                <li>• Advanced Portfolio Allocation</li>
                <li>• Priority Customer Support</li>
                <li>• Weekly Performance Updates</li>
                <li>• Active Risk Management</li>
              </ul>
            </div>
          </Link>

          {/* Elite Plan */}
          <Link to="/signup">
            <div className="animate-pop-out [animation-delay:300ms] bg-primary p-6 flex flex-col h-full gap-5 rounded-xl border border-white/5">
              <Crown className="text-accent" size={40} />

              <div>
                <h3 className="text-white text-xl font-semibold">
                  Elite Plan
                </h3>
                <h5 className="bg-amber-300 inline text-secondary text-sm font-black px-2">
                  (GOLD)
                </h5>
                <p className="text-accent mt-2 text-lg font-bold">
                  ROI: Up to 60% Daily
                </p>
              </div>

              <ul className="text-blue-100 space-y-2 text-[14px]">
                <li>• Minimum Investment: $5,000-10,000</li>
                <li>• Exclusive Investment Opportunities</li>
                <li>• Personal Portfolio Manager</li>
                <li>• Daily Performance Insights</li>
                <li>• VIP Client Services</li>
              </ul>
            </div>
          </Link>

          {/* Supreme Plan */}
          <Link to="/signup">
            <div className="animate-pop-out [animation-delay:400ms] bg-primary p-6 flex flex-col h-full gap-5 rounded-xl border border-white/5">
              <Gem className="text-accent" size={40} />

              <div>
                <h3 className="text-white text-xl font-semibold">
                  Supreme Plan
                </h3>
                <h5 className="bg-red-700 inline text-secondary text-sm font-black px-2">
                  (DIAMOND)
                </h5>
                <p className="text-accent mt-2 text-lg font-bold">
                  ROI: Up to 80% Daily
                </p>
              </div>

              <ul className="text-blue-100 space-y-2 text-[14px]">
                <li>• Minimum Investment: $20,000-$100,000</li>
                <li>• Exclusive Investment Opportunities</li>
                <li>• Personal Portfolio Manager</li>
                <li>• Daily Performance Insights</li>
                <li>• VIP Client Services</li>
              </ul>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlans;