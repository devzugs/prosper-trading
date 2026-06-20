import { TrendingUp } from "lucide-react";
import { PLAN_META, RANK_STYLES } from "./leaderboardData";

const formatProfit = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

const LeaderboardRow = ({ investor, rank, period, index }) => {
  const profit    = investor.profits[period];
  const roi       = investor.roi[period];
  const planMeta  = PLAN_META[investor.plan];
  const rankStyle = RANK_STYLES[rank];
  const isTop3    = rank <= 3;

  return (
    <tr
      className={`border-b border-border/50 last:border-0 my-transition hover:bg-surface/60
        ${index % 2 !== 0 ? "bg-secondary/10" : ""}
        ${isTop3 ? "bg-accent/2" : ""}
      `}
    >
      {/* Rank */}
      <td className="px-5 py-3.5 w-16">
        {isTop3 ? (
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${rankStyle.badge}`}
          >
            {rank}
          </span>
        ) : (
          <span className="text-sm font-medium text-text-muted tabular-nums">
            {rank}
          </span>
        )}
      </td>

      {/* Investor */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isTop3 ? "bg-warning/15 text-warning" : "bg-accent/10 text-accent"
            }`}
          >
            {investor.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading truncate">
              {investor.name}
            </p>
            <p className="text-xs text-text-muted">{investor.country}</p>
          </div>
        </div>
      </td>

      {/* Plan */}
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${planMeta.bg} ${planMeta.color} ${planMeta.border}`}
        >
          {investor.plan}
        </span>
      </td>

      {/* Profit */}
      <td className="px-5 py-3.5 text-right">
        <span className="text-sm font-bold text-success tabular-nums">
          {formatProfit(profit)}
        </span>
      </td>

      {/* ROI */}
      <td className="px-5 py-3.5 text-right hidden md:table-cell">
        <div className="inline-flex items-center justify-end gap-1 text-success/80">
          <TrendingUp size={11} strokeWidth={2.5} />
          <span className="text-sm font-semibold tabular-nums">+{roi}%</span>
        </div>
      </td>
    </tr>
  );
};

export default LeaderboardRow;