// src/pages/client/referral/ReferralTiers.jsx
import React from "react";
import { Check } from "lucide-react";
import { REFERRAL_TIERS, REFERRAL_STATS } from "./referralData";

const ReferralTiers = () => {
  const currentIndex = REFERRAL_TIERS.findIndex((t) => t.id === REFERRAL_STATS.currentTier);

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-heading">Commission Tiers</h2>
        <p className="text-sm text-text-muted">
          Refer <span className="text-accent font-semibold">{REFERRAL_STATS.referralsToNextTier} more</span> to reach the next tier.
        </p>
      </div>

      {/* ── Unified Tiers Panel ── */}
      <div className="bg-surface-alt border border-border rounded-xl flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border shadow-sm my-transition">
        {REFERRAL_TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isCurrent = i === currentIndex;
          const isUnlocked = i <= currentIndex;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col flex-1 p-6 my-transition ${
                isCurrent ? "bg-surface" : "hover:bg-surface/50"
              }`}
            >
              {/* Active State Indicators */}
              {isCurrent && (
                <>
                  {/* Top/Left Highlight Line */}
                  <div className="absolute top-0 left-0 w-1 h-full lg:w-full lg:h-1 bg-accent shadow-[0_0_10px_var(--color-accent)]" />
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                </>
              )}

              {/* Top Row: Icon & Badges */}
              <div className="flex justify-between items-start mb-5 relative z-10">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${tier.bg}`}>
                  <Icon size={18} className={tier.color} />
                </span>

                {isCurrent && (
                  <span className="bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Current
                  </span>
                )}
                
                {isUnlocked && !isCurrent && (
                  <span className="text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check size={12} strokeWidth={3} />
                    Unlocked
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-text-light text-sm font-medium mb-1">{tier.name}</h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-2xl font-bold tracking-tight ${tier.color}`}>
                    {tier.commission}%
                  </span>
                  <span className="text-text-muted text-xs font-medium">Commission</span>
                </div>

                <p className="text-text-muted text-xs mt-auto">
                  {tier.requirement}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralTiers;