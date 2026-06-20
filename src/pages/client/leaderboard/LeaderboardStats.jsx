import { Users, TrendingUp, DollarSign } from "lucide-react";

const formatShort = (n) => {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n;
};

const LeaderboardStats = ({ investors, period }) => {
  const totalProfit = investors.reduce((sum, inv) => sum + inv.profits[period], 0);
  const avgRoi      = (
    investors.reduce((sum, inv) => sum + inv.roi[period], 0) / investors.length
  ).toFixed(1);

  const stats = [
    {
      label: "Total Investors",
      value: investors.length.toLocaleString(),
      icon: Users,
      suffix: "",
    },
    {
      label: "Combined Profits",
      value: formatShort(totalProfit),
      icon: DollarSign,
      suffix: "",
    },
    {
      label: "Average ROI",
      value: avgRoi + "%",
      icon: TrendingUp,
      suffix: "",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-surface-alt border border-border rounded-xl px-3 py-3 sm:px-4 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
        >
          <span className="bg-accent/10 p-1.5 sm:p-2 rounded-lg shrink-0 self-start sm:self-auto">
            <Icon size={14} className="text-accent sm:hidden" />
            <Icon size={16} className="text-accent hidden sm:block" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-text-muted leading-tight truncate">{label}</p>
            <p className="text-sm sm:text-lg font-bold text-heading leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardStats;