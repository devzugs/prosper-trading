import { useState } from "react";
import { Trash2, Eye, ChevronRight } from "lucide-react";
import { TYPE_META, getSummary, getTitle } from "./PaymentHelpers";
import PaymentDetailModal from "./PaymentDetailModal";

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  Pending:  "bg-amber-400/10  text-amber-600  border-amber-300",
  Rejected: "bg-red-500/10   text-red-500   border-red-300",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status] ?? STATUS_STYLES.Pending}`}>
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
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm font-medium text-heading">No payment methods found</p>
          <p className="text-xs text-text-muted">Click the upload button above to add one.</p>
        </div>
      </td>
    </tr>
  );
}

// ── Table Row ──────────────────────────────────────────────────────────────────
function PaymentRow({ payment, onView, onDelete }) {
  // DB mapping: payment.method replaces payment.type, payment.details replaces payment.data
  const dbType = payment.method; 
  const dbData = payment.details; 
  
  const meta = TYPE_META[dbType] || TYPE_META.card; 
  const Icon = meta.Icon;

  return (
    <tr className="group hover:bg-surface-alt/50 my-transition">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt text-text-muted group-hover:bg-accent/10 group-hover:text-accent my-transition">
            <Icon size={18} />
          </div>
          <div>
            <p className="font-semibold text-heading text-sm">{getTitle(dbType, dbData)}</p>
            <p className="text-xs text-text-muted">{meta.label}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-5 py-4 sm:table-cell">
        <span className="text-sm text-text-muted font-mono">{getSummary(dbType, dbData)}</span>
      </td>
      <td className="hidden px-5 py-4 md:table-cell">
        <p className="text-sm text-text-muted">
          {new Date(payment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </td>
      <td className="hidden px-5 py-4 lg:table-cell text-right">
         {/* Since payment methods don't have a status in DB currently, we just show Approved to mirror the mock, or omit entirely */}
        <StatusBadge status="Approved" /> 
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 my-transition">
          <button onClick={() => onView(payment)} className="rounded-md p-2 text-text-muted hover:bg-surface-alt hover:text-accent my-transition">
            <Eye size={16} />
          </button>
          <button onClick={() => onDelete(payment.id)} className="rounded-md p-2 text-text-muted hover:bg-danger/10 hover:text-danger my-transition">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PaymentTable({ payments, onDelete }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {payments.length > 0 && (
            <thead>
              <tr className="border-b border-border bg-surface-alt/50">
                {[
                  { label: "Method", w: "w-[40%] sm:w-[35%]", align: "text-left" },
                  { label: "Details", w: "w-[30%] hidden sm:table-cell", align: "text-left" },
                  { label: "Added On", w: "w-[15%] hidden md:table-cell", align: "text-left" },
                  { label: "Status", w: "w-[15%] hidden lg:table-cell", align: "text-right" },
                  { label: "Actions", w: "w-[20%] sm:w-[15%]", align: "text-right" },
                ].map(({ label, w, align }) => (
                  <th key={label} className={`px-5 py-3.5 font-semibold text-text-muted uppercase tracking-wider text-xs ${w} ${align}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? <EmptyState /> : payments.map((p) => (
              <PaymentRow key={p.id} payment={p} onView={setSelected} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
      {payments.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 border-t border-border/40 py-2 text-xs text-text-muted sm:hidden">
          <ChevronRight size={12} className="rotate-0 opacity-50" />
          Swipe to see more
        </p>
      )}
      <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}