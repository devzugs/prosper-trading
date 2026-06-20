import { TrendingUp } from "lucide-react";
import { PLAN_META, RANK_STYLES } from "./leaderboardData";

const formatProfit = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

const PodiumCard = ({ investor, rank, period }) => {
  const profit    = investor.profits[period];
  const roi       = investor.roi[period];
  const planMeta  = PLAN_META[investor.plan];
  const rankStyle = RANK_STYLES[rank];
  const isFirst   = rank === 1;

  return (
    <div
      className={`relative flex flex-col items-center border rounded-2xl text-center my-transition hover:border-accent/30
        ${isFirst
          ? "bg-surface-alt border-warning/40 shadow-xl shadow-warning/10 px-8 py-8 z-10"
          : "bg-surface-alt border-border px-5 py-6 self-end"
        }`}
    >
      {/* Rank badge */}
      <span
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-bold border
          ${rankStyle.badge}
          ${isFirst ? "text-sm" : "text-xs"}`}
      >
        #{rank}
      </span>

      {/* Avatar */}
      <div
        className={`rounded-full flex items-center justify-center font-bold shrink-0
          ${isFirst
            ? "mt-3 w-20 h-20 text-2xl bg-warning/15 text-warning ring-4 ring-warning/20"
            : "mt-3 w-13 h-13 text-base bg-accent/10 text-accent"
          }`}
        style={isFirst ? {} : { width: "3.25rem", height: "3.25rem" }}
      >
        {investor.initials}
      </div>

      {/* Name + plan */}
      <p className={`mt-3 font-bold text-heading truncate max-w-full ${isFirst ? "text-base" : "text-sm"}`}>
        {investor.name}
      </p>
      <span
        className={`mt-1.5 inline-block font-semibold rounded-full ${planMeta.bg} ${planMeta.color} border ${planMeta.border}
          ${isFirst ? "text-xs px-2.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}
      >
        {investor.plan}
      </span>
      <p className={`mt-0.5 text-text-muted ${isFirst ? "text-xs" : "text-[11px]"}`}>
        {investor.country}
      </p>

      {/* Profit */}
      <div className="mt-4 w-full pt-4 border-t border-border/60">
        <p className={`font-bold text-success ${isFirst ? "text-3xl" : "text-xl"}`}>
          {formatProfit(profit)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-1 text-success/80">
          <TrendingUp size={isFirst ? 13 : 11} />
          <span className={`font-semibold ${isFirst ? "text-sm" : "text-xs"}`}>
            +{roi}% ROI
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodiumCard;