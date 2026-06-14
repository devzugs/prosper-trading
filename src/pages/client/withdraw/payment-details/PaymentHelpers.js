import { CreditCard, Landmark, Bitcoin } from "lucide-react";

// ── Type metadata ──────────────────────────────────────────────────────────────

export const TYPE_META = {
  card:   { label: "Credit Card",    Icon: CreditCard },
  wire:   { label: "Wire Transfer",  Icon: Landmark   },
  crypto: { label: "Crypto Address", Icon: Bitcoin    },
};

// ── Derived display values ─────────────────────────────────────────────────────

/** Short summary shown in the table Details cell */
export function getSummary(type, data) {
  if (type === "card") {
    const last4 = data.cardNumber?.replace(/\s/g, "").slice(-4);
    return last4 ? `•••• ${last4}` : data.cardHolder || "—";
  }
  if (type === "wire")   return data.bankName || data.accountName || "—";
  if (type === "crypto") return data.network  || "—";
  return "—";
}

/** Primary title shown in the table Title cell */
export function getTitle(type, data) {
  if (type === "card")   return data.cardHolder  || "Credit Card";
  if (type === "wire")   return data.accountName || "Wire Transfer";
  if (type === "crypto") {
    return data.walletAddress
      ? data.walletAddress.slice(0, 12) + "…"
      : "Crypto Wallet";
  }
  return "Payment Method";
}