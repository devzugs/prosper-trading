import React, { useState, useMemo } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    Search,
    ChevronLeft,
    ChevronRight,
    ReceiptText,
    ArrowUpDown,
    CheckCircle2,
    Clock3,
    XCircle,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with your real data source / prop
const ALL_TRANSACTIONS = [
    { id: 1,  type: "buy",  asset: "Bitcoin",  symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",        amount: 0.0412, value: 2581.44, price: 62656.31, date: "2025-06-09T14:32:00", status: "completed" },
    { id: 2,  type: "sell", asset: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",      amount: 1.25,   value: 4312.50, price: 3450.00,  date: "2025-06-09T09:15:00", status: "completed" },
    { id: 3,  type: "swap", asset: "Solana",   symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",       amount: 14.0,   value: 2058.00, price: 147.00,   date: "2025-06-08T18:45:00", status: "completed" },
    { id: 4,  type: "buy",  asset: "BNB",      symbol: "BNB", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", amount: 3.5,    value: 2135.00, price: 610.00,   date: "2025-06-08T11:20:00", status: "completed" },
    { id: 5,  type: "sell", asset: "Bitcoin",  symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",        amount: 0.021,  value: 1294.35, price: 61635.71, date: "2025-06-07T16:05:00", status: "pending"   },
    { id: 6,  type: "buy",  asset: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",      amount: 0.8,    value: 2720.00, price: 3400.00,  date: "2025-06-07T08:50:00", status: "completed" },
    { id: 7,  type: "swap", asset: "Solana",   symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",       amount: 8.5,    value: 1232.50, price: 145.00,   date: "2025-06-06T20:30:00", status: "failed"    },
    { id: 8,  type: "buy",  asset: "Bitcoin",  symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",        amount: 0.055,  value: 3380.25, price: 61459.09, date: "2025-06-05T11:10:00", status: "completed" },
    { id: 9,  type: "sell", asset: "BNB",      symbol: "BNB", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", amount: 2.0,    value: 1198.00, price: 599.00,   date: "2025-06-05T08:40:00", status: "completed" },
    { id: 10, type: "buy",  asset: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",      amount: 0.5,    value: 1650.00, price: 3300.00,  date: "2025-06-04T17:25:00", status: "pending"   },
    { id: 11, type: "swap", asset: "Bitcoin",  symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",        amount: 0.015,  value: 915.75,  price: 61050.00, date: "2025-06-03T13:00:00", status: "completed" },
    { id: 12, type: "sell", asset: "Solana",   symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",       amount: 20.0,   value: 2860.00, price: 143.00,   date: "2025-06-02T09:05:00", status: "failed"    },
    { id: 13,  type: "buy",  asset: "Bitcoin",  symbol: "BTC", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",        amount: 0.0412, value: 2581.44, price: 62656.31, date: "2026-06-09T14:32:00", status: "completed" },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    buy:  { label: "Buy",  icon: ArrowDownLeft, iconColor: "text-success", bgColor: "bg-success/10", valuePrefix: "+", valueColor: "text-success"    },
    sell: { label: "Sell", icon: ArrowUpRight,  iconColor: "text-danger",  bgColor: "bg-danger/10",  valuePrefix: "-", valueColor: "text-danger"     },
    swap: { label: "Swap", icon: RefreshCcw,    iconColor: "text-accent",  bgColor: "bg-accent/10",  valuePrefix: "",  valueColor: "text-text-muted" },
};

const STATUS_CONFIG = {
    completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },
    pending:   { label: "Pending",   className: "bg-warning/15 text-warning", icon: Clock3       },
    failed:    { label: "Failed",    className: "bg-danger/10 text-danger",   icon: XCircle      },
};

const STATUS_FILTERS = ["All", "Completed", "Pending", "Failed"];
const PAGE_SIZE      = 8;

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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
                    : "Your trades will appear here once you make your first buy, sell, or swap."}
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
const TransactionHistoryPage = ({ transactions = ALL_TRANSACTIONS }) => {
    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortKey,      setSortKey]      = useState("date");
    const [sortDir,      setSortDir]      = useState("desc");
    const [page,         setPage]         = useState(1);

    const filtered = useMemo(() => {
        let rows = [...transactions];

        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(t =>
                t.asset.toLowerCase().includes(q) ||
                t.symbol.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== "All")
            rows = rows.filter(t => t.status === statusFilter.toLowerCase());

        rows.sort((a, b) => {
            const av = sortKey === "date"   ? new Date(a.date)
                     : sortKey === "value"  ? a.value
                     : a.amount;
            const bv = sortKey === "date"   ? new Date(b.date)
                     : sortKey === "value"  ? b.value
                     : b.amount;
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
                    A full record of every trade on your account.
                </p>
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            {transactions.length > 0 && (
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
                            placeholder="Search asset…"
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

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left    px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Asset</th>
                                    <th className="text-left    px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                                    <th className="text-right   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider"><SortBtn col="amount" label="Amount" /></th>
                                    <th className="text-right   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider"><SortBtn col="value"  label="Value"  /></th>
                                    <th className="text-right   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Price / Unit</th>
                                    <th className="text-right   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider"><SortBtn col="date"   label="Date"   /></th>
                                    <th className="text-right   px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEmpty ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((tx, i) => {
                                        const cfg        = TYPE_CONFIG[tx.type];
                                        const TypeIcon   = cfg.icon;
                                        const statusCfg  = STATUS_CONFIG[tx.status];
                                        const StatusIcon = statusCfg.icon;
                                        return (
                                            <tr
                                                key={tx.id}
                                                className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition ${i % 2 !== 0 ? "bg-secondary/20" : ""}`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={tx.image} alt={tx.asset} className="w-8 h-8 rounded-full" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-heading uppercase">{tx.symbol}</p>
                                                            <p className="text-xs text-text-muted">{tx.asset}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bgColor}`}>
                                                        <TypeIcon size={12} className={cfg.iconColor} />
                                                        <span className={`text-xs font-semibold ${cfg.iconColor}`}>{cfg.label}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="text-sm font-medium text-heading tabular-nums">{tx.amount} {tx.symbol}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className={`text-sm font-bold tabular-nums ${cfg.valueColor}`}>
                                                        {cfg.valuePrefix}${tx.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right hidden lg:table-cell">
                                                    <span className="text-sm text-text-muted tabular-nums">
                                                        ${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <p className="text-sm text-text-light">{formatDate(tx.date)}</p>
                                                    <p className="text-xs text-text-muted">{formatTime(tx.date)}</p>
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
                                const cfg       = TYPE_CONFIG[tx.type];
                                const TypeIcon  = cfg.icon;
                                const statusCfg = STATUS_CONFIG[tx.status];
                                return (
                                    <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-surface my-transition">
                                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                                            <TypeIcon size={16} className={cfg.iconColor} />
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
                                            <p className={`text-sm font-bold tabular-nums ${cfg.valueColor}`}>
                                                {cfg.valuePrefix}${tx.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryPage;