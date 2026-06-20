import { PLAN_META } from "./leaderboardData";

const PLAN_FILTERS = ["All", "Starter", "Growth", "Elite"];

const PlanFilter = ({ activePlan, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PLAN_FILTERS.map((plan) => {
        const meta   = plan !== "All" ? PLAN_META[plan] : null;
        const active = activePlan === plan;

        return (
          <button
            key={plan}
            onClick={() => onChange(plan)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold my-transition border
              ${active
                ? plan === "All"
                  ? "bg-accent text-secondary border-accent"
                  : `${meta.bg} ${meta.color} ${meta.border}`
                : "bg-surface-alt text-text-muted border-border hover:border-accent/30 hover:text-text-light"
              }`}
          >
            {plan}
          </button>
        );
      })}
    </div>
  );
};

export default PlanFilter;