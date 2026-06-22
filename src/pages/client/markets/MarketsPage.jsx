import React, { useState, useMemo } from "react";
import {
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Star,
} from "lucide-react";
import useMarketsData from "../../../hooks/UseMarketsData";
import MarketStats from "./MarketStats";
import TopMovers from "./TopMovers";
import MarketFilterBar from "./MarketFilterBar";
import MarketRow from "./MarketRow";
import MiniSparkline from "./MiniSparkline";

const PAGE_SIZE = 15;

const formatPrice = (p) => {
  if (p == null) return "—";
  const decimals = p < 1 ? 6 : p < 10 ? 4 : 2;
  return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
};

const sortValue = (coin, key) => {
  switch (key) {
    case "price":
      return coin.current_price ?? 0;
    case "change24h":
      return coin.price_change_percentage_24h ?? 0;
    case "volume":
      return coin.total_volume ?? 0;
    case "market_cap":
    default:
      return coin.market_cap ?? 0;
  }
};

const MarketsPage = () => {
  const { coins, loading, error, lastUpdated } = useMarketsData(60);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState("market_cap");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rankMap = useMemo(() => {
    const sorted = [...coins].sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
    const map = new Map();
    sorted.forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [coins]);

  const filtered = useMemo(() => {
    let rows = [...coins];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }

    if (filter === "Gainers") rows = rows.filter((c) => (c.price_change_percentage_24h ?? 0) >= 0);
    if (filter === "Losers") rows = rows.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
    if (filter === "Favorites") rows = rows.filter((c) => favorites.has(c.id));

    rows.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return rows;
  }, [coins, search, filter, favorites, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };
  const handleSearchChange = (v) => {
    setSearch(v);
    setPage(1);
  };

  const SortBtn = ({ col, label }) => (
    <button onClick={() => toggleSort(col)} className="inline-flex items-center gap-1 hover:text-accent my-transition">
      {label}
      <ArrowUpDown size={11} className={sortKey === col ? "text-accent" : "text-text-muted/40"} />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-sm text-text-muted">
        <RefreshCcw size={15} className="animate-spin" />
        Loading market data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-danger">
        Failed to load market data. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="p-6 pb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-accent/10 p-2.5 rounded-xl">
            <ChartColumn size={22} className="text-accent" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-heading">Markets</h1>
            <p className="text-sm text-text-muted mt-0.5">
              Live prices and performance across {coins.length} digital assets.
            </p>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      <div className="p-6 pt-2 space-y-6">
        <MarketStats coins={coins} />
        <TopMovers coins={coins} />

        {/* ── Table card ── */}
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-5">
            <MarketFilterBar
              search={search}
              onSearchChange={handleSearchChange}
              activeFilter={filter}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-16">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Asset</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <SortBtn col="price" label="Price" />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">1h</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <SortBtn col="change24h" label="24h" />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">7d</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                    <SortBtn col="market_cap" label="Market Cap" />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden xl:table-cell">
                    <SortBtn col="volume" label="Volume (24h)" />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Last 7 Days</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-sm text-text-muted">
                      No assets match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((coin, i) => (
                    <MarketRow
                      key={coin.id}
                      coin={coin}
                      rank={rankMap.get(coin.id)}
                      index={i}
                      isFavorite={favorites.has(coin.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col divide-y divide-border/50 md:hidden">
            {paginated.length === 0 ? (
              <p className="py-16 text-center text-sm text-text-muted">No assets match your filters.</p>
            ) : (
              paginated.map((coin) => {
                const pct = coin.price_change_percentage_24h ?? 0;
                const positive = pct >= 0;
                return (
                  <div key={coin.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface/60 my-transition">
                    <button onClick={() => toggleFavorite(coin.id)} aria-label="Toggle favorite">
                      <Star size={13} className={favorites.has(coin.id) ? "fill-warning text-warning" : "text-text-muted"} />
                    </button>
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-heading truncate">{coin.name}</p>
                      <p className="text-xs text-text-muted uppercase">{coin.symbol}</p>
                    </div>
                    <MiniSparkline prices={coin.sparkline_in_7d?.price ?? []} positive={positive} />
                    <div className="text-right shrink-0 w-20">
                      <p className="text-sm font-bold text-heading">{formatPrice(coin.current_price)}</p>
                      <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${positive ? "text-success" : "text-danger"}`}>
                        {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {positive ? "+" : ""}
                        {pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border">
              <span className="text-xs text-text-muted">
                Showing{" "}
                <span className="text-text-light font-medium">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="text-text-light font-medium">{filtered.length}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-border text-text-muted hover:border-accent/40 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed my-transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-xs text-text-muted">
                        …
                      </span>
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
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

export default MarketsPage;