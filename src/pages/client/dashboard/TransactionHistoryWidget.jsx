import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    Clock,
    ArrowRight,
    ScrollText,
} from "lucide-react";

// ─── Shared config (import from a shared file in your real app) ───────────────

const TYPE_CONFIG = {
    buy: {
        label: "Buy",
        icon: ArrowDownLeft,
        iconColor: "text-success",
        bgColor: "bg-success/10",
        valuePrefix: "+",
        valueColor: "text-success",
    },
    sell: {
        label: "Sell",
        icon: ArrowUpRight,
        iconColor: "text-danger",
        bgColor: "bg-danger/10",
        valuePrefix: "-",
        valueColor: "text-danger",
    },
    swap: {
        label: "Swap",
        icon: RefreshCcw,
        iconColor: "text-accent",
        bgColor: "bg-accent/10",
        valuePrefix: "",
        valueColor: "text-text-muted",
    },
};

const STATUS_CONFIG = {
    completed: { label: "Completed", className: "bg-success/10 text-success" },
    pending:   { label: "Pending",   className: "bg-warning/15 text-warning" },
    failed:    { label: "Failed",    className: "bg-danger/10 text-danger"   },
};

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}
function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Dashboard Widget ─────────────────────────────────────────────────────────
// Pass `transactions` as a prop from your data layer.
// When the array is empty (or not yet loaded), the empty state is shown.

const TransactionHistoryWidget = ({ transactions = [] }) => {
    // Show only the 4 most recent on the dashboard
    const recent = transactions.slice(0, 4);
    const isEmpty = transactions.length === 0;

    return (
        <div className="p-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <span className="bg-accent/10 p-2 rounded-lg">
                        <Clock size={18} className="text-accent" />
                    </span>
                    <div>
                        <h2 className="text-xl font-bold text-heading leading-tight">
                            Recent Transactions
                        </h2>
                        {!isEmpty && (
                            <p className="text-xs text-text-muted mt-0.5">
                                {transactions.length} total transaction{transactions.length !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                </div>

                {!isEmpty && (
                    <Link
                        to="/transaction-history"
                        className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 my-transition"
                    >
                        View all
                        <ArrowRight size={14} />
                    </Link>
                )}
            </div>

            {/* ── Empty State ── */}
            {isEmpty ? (
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-surface-alt rounded-xl border border-border border-dashed gap-4">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <div className="hidden sm:flex bg-accent/10 p-3 rounded-full shrink-0">
                            <ScrollText size={20} className="text-accent/60" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-heading mb-0.5">
                                No transactions yet
                            </p>
                            <p className="text-xs text-text-muted">
                                Your trades will appear here once you make your first buy, sell, or swap.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/deposit"
                        className="shrink-0 w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-accent text-secondary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-accent/90 my-transition"
                    >
                        Deposit
                        <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <>
                    {/* ── Table — md+ ── */}
                    <div className="hidden md:block bg-surface-alt rounded-xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {["Asset", "Type", "Amount", "Value", "Date", "Status"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((tx, i) => {
                                    const cfg       = TYPE_CONFIG[tx.type];
                                    const Icon      = cfg.icon;
                                    const statusCfg = STATUS_CONFIG[tx.status];
                                    return (
                                        <tr
                                            key={tx.id}
                                            className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}
                                        >
                                            {/* Asset */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={tx.image} alt={tx.asset} className="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-heading uppercase">{tx.symbol}</p>
                                                        <p className="text-xs text-text-muted">{tx.asset}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Type */}
                                            <td className="px-5 py-4 text-right">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bgColor}`}>
                                                    <Icon size={12} className={cfg.iconColor} />
                                                    <span className={`text-xs font-semibold ${cfg.iconColor}`}>{cfg.label}</span>
                                                </div>
                                            </td>
                                            {/* Amount */}
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-sm font-medium text-heading">
                                                    {tx.amount} {tx.symbol}
                                                </span>
                                            </td>
                                            {/* Value */}
                                            <td className="px-5 py-4 text-right">
                                                <span className={`text-sm font-bold ${cfg.valueColor}`}>
                                                    {cfg.valuePrefix}${tx.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            {/* Date */}
                                            <td className="px-5 py-4 text-right">
                                                <p className="text-sm text-text-light">{formatDate(tx.date)}</p>
                                                <p className="text-xs text-text-muted">{formatTime(tx.date)}</p>
                                            </td>
                                            {/* Status */}
                                            <td className="px-5 py-4 text-right">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Card list — mobile ── */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {recent.map((tx) => {
                            const cfg       = TYPE_CONFIG[tx.type];
                            const Icon      = cfg.icon;
                            const statusCfg = STATUS_CONFIG[tx.status];
                            return (
                                <div
                                    key={tx.id}
                                    className="bg-surface-alt rounded-xl border border-border p-4 flex items-center gap-4 hover:border-accent/30 my-transition"
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                                        <Icon size={16} className={cfg.iconColor} />
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <img src={tx.image} alt={tx.asset} className="w-7 h-7 rounded-full shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-heading truncate">
                                                {cfg.label} {tx.symbol.toUpperCase()}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {formatDate(tx.date)} · {formatTime(tx.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold ${cfg.valueColor}`}>
                                            {cfg.valuePrefix}${tx.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Footer ── */}
                    {transactions.length > 4 && (
                        <div className="flex justify-between items-center mt-4 text-xs text-text-muted">
                            <span>Showing 4 of {transactions.length} transactions</span>
                            <Link
                                to="/transaction-history"
                                className="flex items-center gap-1 text-accent hover:text-accent/80 font-medium my-transition"
                            >
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TransactionHistoryWidget;