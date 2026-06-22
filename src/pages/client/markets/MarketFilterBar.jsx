import { Search } from "lucide-react";

const FILTERS = ["All", "Gainers", "Losers", "Favorites"];

const MarketFilterBar = ({ search, onSearchChange, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pb-5">
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold my-transition border
              ${
                activeFilter === f
                  ? "bg-accent text-secondary border-accent"
                  : "bg-surface text-text-muted border-border hover:border-accent/30 hover:text-text-light"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-64">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search coin or symbol…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50 my-transition"
        />
      </div>
    </div>
  );
};

export default MarketFilterBar;