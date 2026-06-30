import { X } from "lucide-react";
import { TYPE_META, getTitle } from "./PaymentHelpers";

// ── Shared detail row ──────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-text-light font-mono break-all">{value}</span>
    </div>
  );
}

// ── Per-type detail bodies ─────────────────────────────────────────────────────
function CardDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Cardholder" value={data.cardHolder} />
      <DetailRow label="Card Number" value={data.cardNumber} />
      <div className="grid grid-cols-2 gap-4">
        <DetailRow label="Expiry" value={data.expiry} />
        <DetailRow label="CVV" value={"•".repeat(data.cvv?.length || 3)} />
      </div>
    </div>
  );
}

function WireDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Bank Name" value={data.bankName} />
      <DetailRow label="Account Name" value={data.accountName} />
      <DetailRow label="Account Number" value={data.accountNumber} />
      <DetailRow label="Routing / SWIFT" value={data.swiftCode} />
    </div>
  );
}

function CryptoDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Network" value={data.network} />
      <div className="rounded-lg border border-border bg-surface-alt p-3">
        <span className="mb-1 block text-xs font-medium text-text-muted uppercase tracking-wide">
          Wallet Address
        </span>
        <span className="break-all font-mono text-sm text-text-light">
          {data.walletAddress}
        </span>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function PaymentDetailModal({ payment, onClose }) {
  if (!payment) return null;

  // Map DB schema to UI variables
  const dbType = payment.method; 
  const dbData = payment.details;

  const meta = TYPE_META[dbType] || TYPE_META.card;
  const Icon = meta.Icon;
  const label = meta.label;
  const title = getTitle(dbType, dbData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-2xl animate-[fade-up_0.3s_ease_out]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-text-muted">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-heading">{title}</h3>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-text-light my-transition hover:bg-surface-alt hover:text-heading">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Field details based on DB method */}
          {dbType === "card"   && <CardDetail   data={dbData} />}
          {dbType === "wire"   && <WireDetail   data={dbData} />}
          {dbType === "crypto" && <CryptoDetail data={dbData} />}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text-light my-transition hover:bg-surface-alt hover:text-heading">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}