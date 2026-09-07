// src/pages/client/withdraw/withdrawal/withdrawData.js
import { CreditCard, Landmark, Bitcoin } from "lucide-react";

export const MIN_WITHDRAWAL_USD = 5000;
export const DEFAULT_MIN_WITHDRAWAL = 5000;

export const getMinWithdrawal = (_currency) => MIN_WITHDRAWAL_USD;

export const WITHDRAWAL_FEE_PCT = 30; // 30%

export const getSavedMethods = (fullName) => [
  {
    id: "card-1",
    type: "card",
    label: "Visa •••• 4821",
    detail: fullName,
    icon: CreditCard,
    accent: "text-accent",
    bg: "bg-accent/10",
    eta: "3-7 business days",
  },
];