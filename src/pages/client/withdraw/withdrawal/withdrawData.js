// src/pages/client/withdraw/withdrawData.js
import { CreditCard, Landmark, Bitcoin } from "lucide-react";

export const AVAILABLE_BALANCE = 12480.32;
export const MIN_WITHDRAWAL = 50;
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