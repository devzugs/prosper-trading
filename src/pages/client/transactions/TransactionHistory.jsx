import React, { useState, useMemo, useEffect } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Gift,
    TrendingUp,
    SlidersHorizontal,
    ReceiptText,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    Clock3,
    RotateCcw,
    Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

// ─── Config — mirrors transactions.type check constraint in the DB ────────────
const TYPE_CONFIG = {
    deposit:        { label: "Deposit",        icon: ArrowDownLeft,      iconColor: "text-success", bgColor: "bg-success/10" },
    withdrawal:     { label: "Withdrawal",      icon: ArrowUpRight,       iconColor: "text-danger",  bgColor: "bg-danger/10"  },
    referral_bonus: { label: "Referral Bonus",  icon: Gift,               iconColor: "text-accent",  bgColor: "bg-accent/10"  },
    roi_payout:     { label: "ROI Payout",      icon: TrendingUp,         iconColor: "text-success", bgColor: "bg-success/10" },
    adjustment:     { label: "Adjustment",      icon: SlidersHorizontal,  iconColor: "text-accent",  bgColor: "bg-accent/10"  },
    fee:            { label: "Fee",             icon: ReceiptText,        iconColor: "text-danger",  bgColor: "bg-danger/10"  },
};

// mirrors transactions.status check constraint
const STATUS_CONFIG = {
    completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },
    pending:   { label: "Pending",   className: "bg-warning/15 text-warning", icon: Clock3       },
    reversed:  { label: "Reversed",  className: "bg-danger/10 text-danger",   icon: RotateCcw    },
};

const STATUS_FILTERS = ["All", "Completed", "Pending", "Reversed"];
const PAGE_SIZE      = 8;

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function fmtAmount(amount, currency) {
    const n = Number(amount);
    const sign = n > 0 ? "+" : n < 0 ? "" : ""; // negative already carries its own "-"
    return `${sign}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency}`;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onReset }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
        <div className="bg-accent/10 p-5 rounded-full">
            <ReceiptText size={30} className="text-accent/50" />
        </div>
        <div className="text-center">
            <p className="text-sm font-semibold text-heading mb-1">
                {hasFilters ? "No transactions match your filters" : "No transactions yet"}
            </p>
            <p className="text-xs text-text-muted max-w-[240px] leading-relaxed">
                {hasFilters
                    ? "Try adjusting your search or status filter."
                    : "Your deposits, withdrawals, and payouts will appear here once you have activity on your account."}
            </p>
        </div>
        {hasFilters && (
            <button
                onClick={onReset}
                className="text-xs text-accent hover:text-accent/80 font-medium my-transition"
            >
                Clear all filters
            </button>
        )}
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const TransactionHistoryPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortKey,      setSortKey]      = useState("date");
    const [sortDir,      setSortDir]      = useState("desc");
    const [page,         setPage]         = useState(1);

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            setLoading(true);
            
            // Fetch completed/reversed from the ledger, and pending from deposits/withdrawals
            const [txRes, depRes, withRes] = await Promise.all([
                supabase
                    .from("transactions")
                    .select("id, type, currency, amount, status, note, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("deposits")
                    .select("id, coin, amount, status, created_at")
                    .eq("user_id", user.id)
                    .eq("status", "pending"),
                supabase
                    .from("withdrawals")
                    .select("id, currency, amount, status, created_at")
                    .eq("user_id", user.id)
                    .eq("status", "pending")
            ]);

            if (txRes.error || depRes.error || withRes.error) {
                console.error("Error fetching transactions:", txRes.error || depRes.error || withRes.error);
                setLoadError("Couldn't load your transaction history. Please try again.");
            } else {
                // Normalize pending deposits to match the transactions schema
                const pendingDeposits = (depRes.data || []).map(d => ({
                    id: d.id,
                    type: "deposit",
                    currency: d.coin, // The deposits table uses 'coin' instead of 'currency'
                    amount: d.amount,
                    status: d.status,
                    note: "Pending admin review",
                    created_at: d.created_at
                }));

                // Normalize pending withdrawals
                const pendingWithdrawals = (withRes.data || []).map(w => ({
                    id: w.id,
                    type: "withdrawal",
                    currency: w.currency,
                    // The ledger tracks withdrawals as negative values, so we mirror that here
                    amount: -Math.abs(w.amount), 
                    status: w.status,
                    note: "Pending admin review",
                    created_at: w.created_at
                }));

                // Merge all records and sort them by date descending
                const allTransactions = [...(txRes.data || []), ...pendingDeposits, ...pendingWithdrawals];
                allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setTransactions(allTransactions);
            }
            setLoading(false);
        };

        fetchTransactions();
    }, [user]);

    const filtered = useMemo(() => {
        let rows = [...transactions];

        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(t =>
                (TYPE_CONFIG[t.type]?.label || t.type).toLowerCase().includes(q) ||
                t.currency.toLowerCase().includes(q) ||
                (t.note || "").toLowerCase().includes(q)
            );
        }

        if (statusFilter !== "All")
            rows = rows.filter(t => t.status === statusFilter.toLowerCase());

        rows.sort((a, b) => {
            const av = sortKey === "date" ? new Date(a.created_at) : Number(a.amount);
            const bv = sortKey === "date" ? new Date(b.created_at) : Number(b.amount);
            return sortDir === "asc" ? av - bv : bv - av;
        });

        return rows;
    }, [transactions, search, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
        setPage(1);
    };

    const handleStatusFilter = (val) => { setStatusFilter(val); setPage(1); };
    const handleSearch       = (val) => { setSearch(val);       setPage(1); };
    const resetFilters       = ()    => { setSearch(""); setStatusFilter("All"); setPage(1); };

    const hasActiveFilters = search.trim() !== "" || statusFilter !== "All";
    const isEmpty          = filtered.length === 0;

    const SortBtn = ({ col, label }) => (
        <button
            onClick={() => toggleSort(col)}
            className="inline-flex items-center gap-1 hover:text-accent my-transition"
        >
            {label}
            <ArrowUpDown size={11} className={sortKey === col ? "text-accent" : "text-text-muted/40"} />
        </button>
    );

    return (
        <div className="min-h-screen">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="p-6 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-heading">
                    Transaction History
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    A full record of every deposit, withdrawal, and payout on your account.
                </p>
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            {!loading && transactions.length > 0 && (
                <div className="px-6 pb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">

                    {/* Status pills */}
                    <div className="flex gap-1.5 flex-wrap">
                        {STATUS_FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => handleStatusFilter(f)}
                                className={`px-3 py-1 rounded-full text-xs font-medium my-transition border ${
                                    statusFilter === f
                                        ? "bg-accent text-secondary border-accent"
                                        : "bg-surface-alt text-text-muted border-border hover:border-accent/40 hover:text-text-light"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search transactions…"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            className="bg-surface-alt border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50 w-full sm:w-52 my-transition"
                        />
                    </div>
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="px-6 pb-6">
                <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-accent" />
                        </div>
                    ) : loadError ? (
                        <p className="text-sm text-danger text-center py-20">{loadError}</p>
                    ) : (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left    px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                                            <th className="text-left   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Note</th>
                                            <th className="text-right  px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider"><SortBtn col="amount" label="Amount" /></th>
                                            <th className="text-right  px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider"><SortBtn col="date"   label="Date"   /></th>
                                            <th className="text-right  px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isEmpty ? (
                                            <tr>
                                                <td colSpan={5}>
                                                    <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
                                                </td>
                                            </tr>
                                        ) : (
                                            paginated.map((tx, i) => {
                                                const cfg        = TYPE_CONFIG[tx.type] || TYPE_CONFIG.adjustment;
                                                const TypeIcon   = cfg.icon;
                                                const statusCfg  = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                                                const StatusIcon = statusCfg.icon;
                                                const amountColor = Number(tx.amount) >= 0 ? "text-success" : "text-danger";
                                                return (
                                                    <tr
                                                        key={tx.id}
                                                        className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bgColor}`}>
                                                                <TypeIcon size={12} className={cfg.iconColor} />
                                                                <span className={`text-xs font-semibold ${cfg.iconColor}`}>{cfg.label}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-sm text-text-muted">{tx.note || "—"}</span>
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
                                                            <span className={`inline-flex items-center justify-end gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                                                                <StatusIcon size={11} />
                                                                {statusCfg.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <div className="flex flex-col md:hidden divide-y divide-border/50">
                                {isEmpty ? (
                                    <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
                                ) : (
                                    paginated.map((tx) => {
                                        const cfg        = TYPE_CONFIG[tx.type] || TYPE_CONFIG.adjustment;
                                        const TypeIcon   = cfg.icon;
                                        const statusCfg  = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                                        const amountColor = Number(tx.amount) >= 0 ? "text-success" : "text-danger";
                                        return (
                                            <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-surface my-transition">
                                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                                                    <TypeIcon size={16} className={cfg.iconColor} />
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
                                    })
                                )}
                            </div>

                            {/* Pagination */}
                            {!isEmpty && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border">
                                    <span className="text-xs text-text-muted">
                                        Showing{" "}
                                        <span className="text-text-light font-medium">
                                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                                        </span>
                                        {" "}of{" "}
                                        <span className="text-text-light font-medium">{filtered.length}</span>
                                        {" "}transactions
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-1.5 rounded-md border border-border text-text-muted hover:border-accent/40 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed my-transition"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                            .reduce((acc, n, idx, arr) => {
                                                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                                                acc.push(n);
                                                return acc;
                                            }, [])
                                            .map((n, i) =>
                                                n === "…" ? (
                                                    <span key={`ellipsis-${i}`} className="px-2 text-xs text-text-muted">…</span>
                                                ) : (
                                                    <button
                                                        key={n}
                                                        onClick={() => setPage(n)}
                                                        className={`w-7 h-7 rounded-md text-xs font-medium my-transition ${
                                                            page === n
                                                                ? "bg-accent text-secondary"
                                                                : "text-text-muted hover:text-accent border border-border hover:border-accent/40"
                                                        }`}
                                                    >
                                                        {n}
                                                    </button>
                                                )
                                            )
                                        }

                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-1.5 rounded-md border border-border text-text-muted hover:border-accent/40 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed my-transition"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryPage;