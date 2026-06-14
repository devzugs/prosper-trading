import { X } from "lucide-react";
import { TYPE_META, getTitle } from "./paymentHelpers";

// ── Shared detail row ──────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-text font-mono break-all">{value}</span>
    </div>
  );
}

// ── Per-type detail bodies ─────────────────────────────────────────────────────

function CardDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Cardholder"  value={data.cardHolder} />
      <DetailRow label="Card Number" value={data.cardNumber} />
      <div className="grid grid-cols-2 gap-4">
        <DetailRow label="Expiry" value={data.expiry} />
        <DetailRow label="CVV"    value={"•".repeat(data.cvv?.length || 0)} />
      </div>
    </div>
  );
}

function WireDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Bank Name"            value={data.bankName}      />
      <DetailRow label="Account Name"         value={data.accountName}   />
      <DetailRow label="Account Number / IBAN" value={data.accountNumber} />
      <DetailRow label="SWIFT / BIC Code"     value={data.swiftCode}     />
      <DetailRow label="Bank Address"         value={data.bankAddress}   />
    </div>
  );
}

function CryptoDetail({ data }) {
  return (
    <div className="space-y-4">
      <DetailRow label="Network"        value={data.network}       />
      <DetailRow label="Wallet Address" value={data.walletAddress} />
    </div>
  );
}

// ── Status badge (mirrors table badge) ────────────────────────────────────────

const STATUS_STYLES = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Pending:  "bg-amber-400/10  text-amber-600  border-amber-300",
  Rejected: "bg-red-500/10   text-red-500   border-red-300",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

export default function PaymentDetailModal({ payment, onClose }) {
  if (!payment) return null;

  const { label, Icon } = TYPE_META[payment.type] ?? TYPE_META.card;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-2xl flex flex-col animate-pop-out">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-heading">
                {getTitle(payment.type, payment.data)}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-light my-transition hover:bg-surface-alt hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center justify-between rounded-lg bg-surface-alt border border-border/60 px-4 py-3">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Status
            </span>
            <StatusBadge status={payment.status ?? "Pending"} />
          </div>

          {/* Field details */}
          {payment.type === "card"   && <CardDetail   data={payment.data} />}
          {payment.type === "wire"   && <WireDetail   data={payment.data} />}
          {payment.type === "crypto" && <CryptoDetail data={payment.data} />}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text my-transition hover:bg-surface-alt hover:text-heading"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}