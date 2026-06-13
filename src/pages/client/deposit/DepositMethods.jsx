import { CreditCard,
        Building2,
        Wallet,
    } from "lucide-react";

// ─── Deposit method config ────────────────────────────────────────────────────
const DepositMethods = [
    {
        id: "card",
        label: "Card",
        subtext: "Pay with debit or credit card via Paybis",
        icon: CreditCard,
        accent: "text-accent",
        bg: "bg-accent/10",
        border: "hover:border-accent/50",
        tag: "Instant",
        tagColor: "bg-success/10 text-success",
        provider: "paybis",
    },
    {
        id: "bank",
        label: "Bank Transfer",
        subtext: "Send via bank transfer or SEPA through MoonPay",
        icon: Building2,
        accent: "text-warning",
        bg: "bg-warning/10",
        border: "hover:border-warning/40",
        tag: "1–3 days",
        tagColor: "bg-warning/10 text-warning",
        provider: "moonpay",
    },
    {
        id: "wallet",
        label: "External Wallet",
        subtext: "Send from any external crypto wallet directly",
        icon: Wallet,
        accent: "text-success",
        bg: "bg-success/10",
        border: "hover:border-success/40",
        tag: "On-chain",
        tagColor: "bg-accent/10 text-accent",
        provider: null,
    },
];

export default DepositMethods;