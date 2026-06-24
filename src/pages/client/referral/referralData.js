// src/pages/client/referral/referralData.js
import { Coins, TrendingUp, Crown, Gem } from "lucide-react";

// ── Commission tier structure ──────────────────────────────────────────────
export const REFERRAL_TIERS = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Coins,
    commission: 5,
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
    requirement: "30+ referrals",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
];

// ── Mock referred users ─────────────────────────────────────────────────────
export const REFERRED_USERS = [
  { id: 1, name: "Daniel Carter",      initials: "DC", plan: "Growth",  status: "active",   joinedDate: "2026-05-12T10:00:00", totalDeposited: 8200,  commissionEarned: 656  },
  { id: 2, name: "Priya Nair",         initials: "PN", plan: "Starter", status: "active",   joinedDate: "2026-05-02T10:00:00", totalDeposited: 1200,  commissionEarned: 96   },
  { id: 3, name: "Lucas Bergström",    initials: "LB", plan: "Elite",   status: "active",   joinedDate: "2026-04-18T10:00:00", totalDeposited: 24000, commissionEarned: 1920 },
  { id: 4, name: "Amara Okafor",       initials: "AO", plan: "Growth",  status: "pending",  joinedDate: "2026-06-10T10:00:00", totalDeposited: 0,     commissionEarned: 0    },
  { id: 5, name: "Wei Chen",           initials: "WC", plan: "Starter", status: "inactive", joinedDate: "2026-02-22T10:00:00", totalDeposited: 600,   commissionEarned: 48   },
];

export const REFERRAL_STATS = {
  totalReferrals: REFERRED_USERS.length,
  activeReferrals: REFERRED_USERS.filter((u) => u.status === "active").length,
  totalEarnings: REFERRED_USERS.reduce((sum, u) => sum + u.commissionEarned, 0),
  pendingEarnings: 184.5,
  currentTier: "silver",
  referralsToNextTier: 10,
};

export const STATUS_META = {
  active:   { label: "Active",   className: "bg-success/10 text-success" },
  pending:  { label: "Pending",  className: "bg-warning/15 text-warning" },
  inactive: { label: "Inactive", className: "bg-text-muted/10 text-text-muted" },
};