// src/pages/client/referral/referralData.js
import { Coins, TrendingUp, Crown, Gem } from "lucide-react";

export const REFERRAL_TIERS = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Coins,
    commission: 5,
    minReferrals: 0,
    maxReferrals: 4,
    requirement: "0 - 4 referrals",
    color: "text-text-light",
    bg: "bg-surface",
    border: "border-border",
  },
  {
    id: "silver",
    name: "Silver",
    icon: TrendingUp,
    commission: 8,
    minReferrals: 5,
    maxReferrals: 14,
    requirement: "5 - 14 referrals",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    commission: 12,
    minReferrals: 15,
    maxReferrals: 29,
    requirement: "15 - 29 referrals",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: Gem,
    commission: 15,
    minReferrals: 30,
    maxReferrals: null, // no upper bound
    requirement: "30+ referrals",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
];