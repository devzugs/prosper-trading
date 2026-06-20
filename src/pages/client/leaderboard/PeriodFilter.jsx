import { PERIOD_OPTIONS } from "./leaderboardData";

const PeriodFilter = ({ activePeriod, onChange }) => {
  return (
    <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl p-1">
      {PERIOD_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium my-transition
            ${activePeriod === key
              ? "bg-accent text-secondary shadow-sm shadow-accent/20"
              : "text-text-muted hover:text-text-light hover:bg-white/5"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default PeriodFilter;