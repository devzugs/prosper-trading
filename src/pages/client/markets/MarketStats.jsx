import { DollarSign, BarChart3, Coins, Activity } from "lucide-react";

const formatShort = (n) => {
  if (n >= 1_000_000_000_000) return "$" + (n / 1_000_000_000_000).toFixed(2) + "T";
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  return "$" + n;
};

const MarketStats = ({ coins }) => {
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalVolume = coins.reduce((sum, c) => sum + (c.total_volume || 0), 0);
  const btc = coins.find((c) => c.id === "bitcoin");
  const btcDominance =
    btc && totalMarketCap > 0 ? ((btc.market_cap / totalMarketCap) * 100).toFixed(1) : "—";
  const gainersCount = coins.filter((c) => (c.price_change_percentage_24h ?? 0) >= 0).length;

  const stats = [
    { label: "Market Cap", value: formatShort(totalMarketCap), icon: DollarSign },
    { label: "24h Volume", value: formatShort(totalVolume), icon: BarChart3 },
    { label: "BTC Dominance", value: `${btcDominance}%`, icon: Coins },
    { label: "Coins Up (24h)", value: `${gainersCount}/${coins.length}`, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-surface-alt border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-accent/40 my-transition"
        >
          <span className="bg-accent/10 p-2 rounded-lg shrink-0">
            <Icon size={16} className="text-accent" />
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

export default MarketStats;