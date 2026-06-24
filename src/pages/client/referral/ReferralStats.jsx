// src/pages/client/referral/ReferralStats.jsx
import React from "react";
import { Users, UserCheck, DollarSign, Clock3 } from "lucide-react";
import { REFERRAL_STATS } from "./referralData";

const fmt = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ReferralStats = () => {
  const stats = [
    { label: "Total Referrals",   value: REFERRAL_STATS.totalReferrals,         icon: Users },
    { label: "Active Referrals",  value: REFERRAL_STATS.activeReferrals,        icon: UserCheck },
    { label: "Total Earnings",    value: fmt(REFERRAL_STATS.totalEarnings),     icon: DollarSign },
    { label: "Pending Earnings",  value: fmt(REFERRAL_STATS.pendingEarnings),   icon: Clock3 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-surface-alt rounded-lg border border-border p-4 hover:border-accent/40 my-transition"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-text-light mt-1">{label}</p>
            <span className="bg-accent/10 p-1.5 rounded-md">
              <Icon size={18} className="text-accent" />
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-heading mt-1">{value}</h3>
        </div>
      ))}
    </div>
  );
};

export default ReferralStats;