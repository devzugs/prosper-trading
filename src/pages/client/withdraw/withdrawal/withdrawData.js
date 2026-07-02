// src/pages/client/withdraw/withdrawData.js
import { CreditCard, Landmark, Bitcoin } from "lucide-react";

// Minimum withdrawal amount, per currency. Keys must match the exact
// currency string stored in wallets.currency / withdrawals.currency (the
// coin's full name, e.g. "Bitcoin" — not the ticker "BTC"). These are fixed
// quantities, not USD-equivalents — no live price feed is used to compute
// them, so they need to be updated by hand if a coin's typical value shifts
// a lot.
export const MIN_WITHDRAWAL_BY_CURRENCY = {
  USD: 50,
  Bitcoin: 0.0005,
  Ethereum: 0.01,
  Tether: 50,
  BNB: 0.05,
  Solana: 0.5,
};

// Fallback minimum for any currency not listed above (e.g. a coin added to
// the deposit flow later but not yet given its own minimum here).
export const DEFAULT_MIN_WITHDRAWAL = 50;

export const getMinWithdrawal = (currency) =>
  MIN_WITHDRAWAL_BY_CURRENCY[currency] ?? DEFAULT_MIN_WITHDRAWAL;

export const WITHDRAWAL_FEE_PCT = 1.5; // %

export const SAVED_METHODS = [
  {
    id: "card-1",
    type: "card",
    label: "Visa •••• 4821",
    detail: "Michael Anderson",
    icon: CreditCard,
    accent: "text-accent",
    bg: "bg-accent/10",
    eta: "3-7 business days",
  },
//  
];