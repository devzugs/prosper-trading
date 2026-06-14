import { useState } from "react";
import { CreditCard, Trash2, Eye, ChevronRight } from "lucide-react";
import { TYPE_META, getSummary } from "./paymentHelpers";
import PaymentDetailModal from "./PaymentDetailModal";

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Pending:  "bg-amber-400/10  text-amber-600  border-amber-300",
  Rejected: "bg-red-500/10   text-red-500   border-red-300",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        STATUS_STYLES[status] ?? STATUS_STYLES.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status ?? "Pending"}
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-6 text-center">
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <CreditCard size={36} className="opacity-30" />
          <p className="text-sm">No payment methods added yet.</p>
          <p className="text-xs opacity-70">
            Use the upload button above to get started.
          </p>
        </div>
      </td>
    </tr>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────────

function PaymentRow({ payment, onView, onDelete }) {
  const { label, Icon } = TYPE_META[payment.type] ?? TYPE_META.card;

  return (
    <tr className="my-transition hover:bg-surface-alt/50 group">
      {/* Title */}
      <td className="px-5 py-4 min-w-[140px]">
        <span className="font-medium text-heading whitespace-nowrap">
          {label}
        </span>
      </td>

      {/* Type badge */}
      <td className="px-5 py-4 min-w-[140px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text whitespace-nowrap">
          <Icon size={12} className="text-primary shrink-0" />
          {label}
        </span>
      </td>

      {/* Summary */}
      <td className="px-5 py-4 font-mono text-text-muted text-xs min-w-[120px] whitespace-nowrap">
        {getSummary(payment.type, payment.data)}
      </td>

      {/* Status */}
      <td className="px-5 py-4 min-w-[110px]">
        <StatusBadge status={payment.status} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4 min-w-[120px]">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(payment)}
            title="View details"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-primary px-3 py-1.5 text-xs font-medium text-text my-transition hover:bg-primary hover:text-white hover:border-primary whitespace-nowrap"
          >
            <Eye size={13} />
            View
            <ChevronRight size={12} className="opacity-50" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(payment.id)}
            title="Delete payment method"
            className="rounded-md border border-danger bg-red-500/10 p-1.5 text-danger my-transition hover:bg-red-500 hover:border-red-500 hover:text-white"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PaymentTable({ payments, onDelete }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-sm" style={{ minWidth: payments.length > 0 ? "640px" : "unset" }}>
            {payments.length > 0 && (
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  {[
                    { label: "Title",   w: "w-[14%] lg:w-[28%]", align: "text-left"  },
                    { label: "Type",    w: "w-[10%] lg:w-[20%]", align: "text-left"  },
                    { label: "Details", w: "w-[9%] lg:w-[18%]",  align: "text-left"  },
                    { label: "Status",  w: "w-[8%] lg:w-[16%]",  align: "text-left"  },
                    { label: "Actions", w: "w-[9%] lg:w-[18%]",  align: "text-right" },
                  ].map(({ label, w, align }) => (
                    <th
                      key={label}
                      className={`px-5 py-3.5 font-semibold text-text-muted uppercase tracking-wider text-xs ${w} ${align}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <EmptyState />
              ) : (
                payments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onView={setSelected}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Scroll hint — only visible on small screens when there's data */}
        {payments.length > 0 && (
          <p className="flex items-center justify-center gap-1.5 border-t border-border/40 py-2 text-xs text-text-muted sm:hidden">
            <ChevronRight size={12} className="rotate-0 opacity-50" />
            Swipe to see more
          </p>
        )}
      </div>

      <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />
    </>
  );
}