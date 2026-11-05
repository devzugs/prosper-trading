// src/pages/client/referral/ReferralStats.jsx
import React from "react";
import useCryptoData from "../../../hooks/UseCryptoData";
import { referralUsdTotal, formatReferralUsd } from "./referralUsd";
import { Users, UserCheck, DollarSign, Clock3 } from "lucide-react";


const ReferralStats = ({ stats }) => {
  const { coins, loading } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana,usd-coin");
  const fmt = amounts => {
    const value = referralUsdTotal(amounts, coins || []);
    return value === null ? (loading ? "Loading price…" : "Price unavailable") : formatReferralUsd(value);
  };
  const {
    totalReferrals = 0,
    activeReferrals = 0,
    totalEarned = {},
    availableEarned = {},
  } = stats || {};

  const cards = [
    { label: "Total Referrals",  value: totalReferrals,      icon: Users },
    { label: "Active Referrals", value: activeReferrals,     icon: UserCheck },
    { label: "Total Referral Earnings",   value: fmt(totalEarned),    icon: DollarSign },
    { label: "Available Referral Earnings", value: fmt(availableEarned), icon: Clock3 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon }) => (
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
          <h3 className="text-xl font-bold text-heading mt-1 break-words">{value}</h3>
        </div>
      ))}
    </div>
  );
};

export default ReferralStats;
