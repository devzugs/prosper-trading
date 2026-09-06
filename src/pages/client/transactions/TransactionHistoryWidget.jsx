import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Gift,
    TrendingUp,
    SlidersHorizontal,
    ReceiptText,
    Clock,
    ArrowRight,
    ScrollText,
} from "lucide-react";
import TransactionReceiptModal from "./TransactionReceiptModal";

const TYPE_CONFIG = {
    deposit:        { label: "Deposit",       icon: ArrowDownLeft,     iconColor: "text-success", bgColor: "bg-success/10" },
    withdrawal:     { label: "Withdrawal",     icon: ArrowUpRight,      iconColor: "text-danger",  bgColor: "bg-danger/10"  },
    referral_bonus: { label: "Referral Bonus", icon: Gift,              iconColor: "text-accent",  bgColor: "bg-accent/10"  },
    roi_payout:     { label: "ROI Payout",     icon: TrendingUp,        iconColor: "text-success", bgColor: "bg-success/10" },
     adjustment:     { label: "ROI",            icon: SlidersHorizontal,  iconColor: "text-accent",  bgColor: "bg-accent/10"  },
    fee:            { label: "Fee",            icon: ReceiptText,       iconColor: "text-danger",  bgColor: "bg-danger/10"  },
};

const STATUS_CONFIG = {
    completed: { label: "Completed", className: "bg-success/10 text-success" },
    pending:   { label: "Pending",   className: "bg-warning/15 text-warning" },
    reversed:  { label: "Rejected",  className: "bg-danger/10 text-danger"   },
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
function fmtAmount(amount, currency) {
    const n = Number(amount);
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency}`;
}

const TransactionHistoryWidget = ({ transactions = [], totalCount }) => {
    const [selectedTx, setSelectedTx] = useState(null);
    const total = totalCount ?? transactions.length;
    const recent = transactions.slice(0, 4);
    const isEmpty = total === 0;

    return (
        <div className="p-6">
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
                                {total} total transaction{total !== 1 ? "s" : ""}
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
                                Your deposits, withdrawals, and payouts will appear here once you have activity on your account.
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
                    <div className="hidden md:block bg-surface-alt rounded-xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {["Type", "Amount", "Date", "Status"].map((h, i) => (
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
                                    const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.adjustment;
                                    const Icon = cfg.icon;
                                    const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                                    const amountColor = Number(tx.amount) >= 0 ? "text-success" : "text-danger";
                                    return (
                                        <tr
                                            key={tx.id}
                                            onClick={() => setSelectedTx(tx)}
                                            className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition cursor-pointer ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bgColor}`}>
                                                    <Icon size={12} className={cfg.iconColor} />
                                                    <span className={`text-xs font-semibold ${cfg.iconColor}`}>{cfg.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className={`text-sm font-bold tabular-nums ${amountColor}`}>
                                                    {fmtAmount(tx.amount, tx.currency)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <p className="text-sm text-text-light">{formatDate(tx.created_at)}</p>
                                                <p className="text-xs text-text-muted">{formatTime(tx.created_at)}</p>
                                            </td>
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

                    <div className="flex flex-col gap-3 md:hidden">
                        {recent.map((tx) => {
                            const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.adjustment;
                            const Icon = cfg.icon;
                            const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                            const amountColor = Number(tx.amount) >= 0 ? "text-success" : "text-danger";
                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="bg-surface-alt rounded-xl border border-border p-4 flex items-center gap-4 hover:border-accent/30 my-transition cursor-pointer"
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                                        <Icon size={16} className={cfg.iconColor} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-heading truncate">{cfg.label}</p>
                                        <p className="text-xs text-text-muted">
                                            {formatDate(tx.created_at)} · {formatTime(tx.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold tabular-nums ${amountColor}`}>
                                            {fmtAmount(tx.amount, tx.currency)}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {total > 4 && (
                        <div className="flex justify-between items-center mt-4 text-xs text-text-muted">
                            <span>Showing 4 of {total} transactions</span>
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

            <TransactionReceiptModal 
                transaction={selectedTx} 
                onClose={() => setSelectedTx(null)} 
            />
        </div>
    );
};

export default TransactionHistoryWidget;