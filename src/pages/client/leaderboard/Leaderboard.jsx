import { useState, useMemo, useEffect } from "react";
import { Trophy, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { INVESTORS, PERIOD_OPTIONS } from "./leaderboardData";
import PeriodFilter from "./PeriodFilter";
import PlanFilter from "./PlanFilter";
import PodiumCard from "./PodiumCard";
import LeaderboardRow from "./LeaderboardRow";
import LeaderboardStats from "./LeaderboardStats";

const PAGE_SIZE = 20;

const Leaderboard = () => {
  const [period,      setPeriod]      = useState("allTime");
  const [planFilter,  setPlanFilter]  = useState("All");
  const [search,      setSearch]      = useState("");
  const [sortKey,     setSortKey]     = useState("profit");
  const [sortDir,     setSortDir]     = useState("desc");
  const [page,        setPage]        = useState(1);
  const [isDesktop,   setIsDesktop]   = useState(true);

  // Track viewport width to sync data logic with CSS breakpoints
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Sort + filter the full investor list (rank is determined before plan/search filters)
  const ranked = useMemo(() => {
    return [...INVESTORS].sort((a, b) =>
      sortDir === "desc"
        ? (sortKey === "roi"
            ? b.roi[period]     - a.roi[period]
            : b.profits[period] - a.profits[period])
        : (sortKey === "roi"
            ? a.roi[period]     - b.roi[period]
            : a.profits[period] - b.profits[period])
    );
  }, [period, sortKey, sortDir]);

  // Top 3 from unfiltered ranked list (global podium)
  const podium = ranked.slice(0, 3);
  const podiumIds = new Set(podium.map(inv => inv.id));

  // Apply plan + search filters after ranking so rank numbers stay consistent.
  const filtered = useMemo(() => {
    let rows = ranked;
    if (planFilter !== "All") rows = rows.filter(inv => inv.plan === planFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(inv => inv.name.toLowerCase().includes(q));
    }
    // Only hide podium entries from the table if filters are clear AND we are on a desktop screen
    if (planFilter === "All" && !search.trim() && isDesktop) {
      rows = rows.filter(inv => !podiumIds.has(inv.id));
    }
    return rows;
  }, [ranked, planFilter, search, isDesktop]); // Added isDesktop as a dependency

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const periodLabel = PERIOD_OPTIONS.find(p => p.key === period)?.label ?? "";

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const handlePlanChange   = (p) => { setPlanFilter(p); setPage(1); };
  const handleSearchChange = (v) => { setSearch(v);     setPage(1); };

  // Podium triggers via JS logic now, matching the CSS threshold
  const podiumActive = planFilter === "All" && !search.trim() && isDesktop;

  const SortBtn = ({ col, label }) => (
    <button
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 hover:text-accent my-transition"
    >
      {label}
      <ArrowUpDown
        size={11}
        className={sortKey === col ? "text-accent" : "text-text-muted/40"}
      />
    </button>
  );

  return (
    <div className="min-h-screen">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <span className="bg-warning/10 p-2.5 rounded-xl">
          <Trophy size={22} className="text-warning" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Leaderboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Top-performing investors ranked by {periodLabel.toLowerCase()} profits.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Controls row ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PeriodFilter activePeriod={period} onChange={(p) => { setPeriod(p); setPage(1); }} />
          <PlanFilter activePlan={planFilter} onChange={handlePlanChange} />
        </div>

        {/* ── Stats strip ─────────────────────────────────────────── */}
        <LeaderboardStats investors={ranked} period={period} />

        {/* ── Podium — hidden on mobile, visible md+ ─────────────── */}
        {podiumActive && (
          <div className="hidden md:grid md:grid-cols-3 gap-4 items-end mb-2">
            {/* Arrange: 2nd | 1st | 3rd */}
            <PodiumCard investor={podium[1]} rank={2} period={period} />
            <PodiumCard investor={podium[0]} rank={1} period={period} />
            <PodiumCard investor={podium[2]} rank={3} period={period} />
          </div>
        )}

        {/* ── Search + table ──────────────────────────────────────── */}
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">

          {/* Table toolbar */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/60">
            <p className="text-xs text-text-muted font-medium hidden sm:block">
              {filtered.length} investor{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="relative w-full sm:w-56">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search investor…"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50 my-transition"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                    Plan
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <SortBtn col="profit" label={`${periodLabel} Profit`} />
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                    <SortBtn col="roi" label="ROI" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-text-muted">
                      No investors match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((investor, i) => {
                    const globalRank = ranked.findIndex(r => r.id === investor.id) + 1;
                    return (
                      <LeaderboardRow
                        key={investor.id}
                        investor={investor}
                        rank={globalRank}
                        period={period}
                        index={i}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col divide-y divide-border/50 md:hidden">
            {paginated.length === 0 ? (
              <p className="py-16 text-center text-sm text-text-muted">
                No investors match your filters.
              </p>
            ) : (
              paginated.map((investor, i) => {
                const globalRank = ranked.findIndex(r => r.id === investor.id) + 1;
                const planMeta   = PLAN_META_IMPORT[investor.plan];
                const profit     = investor.profits[period];
                const roi        = investor.roi[period];
                return (
                  <div
                    key={investor.id}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface/60 my-transition"
                  >
                    <span className={`w-8 text-center text-sm font-bold ${globalRank <= 3 ? "text-warning" : "text-text-muted"}`}>
                      {globalRank}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                      {investor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-heading truncate">{investor.name}</p>
                      <span className={`text-[10px] font-semibold ${planMeta.color}`}>{investor.plan}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-success">${profit.toLocaleString()}</p>
                      <p className="text-xs text-success/70">+{roi}%</p>
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
                </span>
                {" "}of{" "}
                <span className="text-text-light font-medium">{filtered.length}</span>
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
                  )}
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

import { PLAN_META as PLAN_META_IMPORT } from "./leaderboardData";

export default Leaderboard;