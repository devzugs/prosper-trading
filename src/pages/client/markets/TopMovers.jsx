import { TrendingUp, Flame } from "lucide-react";

const TopMoverCard = ({ coin, rank }) => {
  const pct = coin.price_change_percentage_24h ?? 0;

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4 hover:border-accent/40 my-transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-heading uppercase">{coin.symbol}</p>
            <p className="text-[11px] text-text-muted truncate max-w-24">{coin.name}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning shrink-0">
          #{rank}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-heading tabular-nums">
          ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
        <span className="inline-flex items-center gap-1 text-success text-sm font-bold shrink-0">
          <TrendingUp size={13} />
          +{pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

const TopMovers = ({ coins = [] }) => {
  const gainers = [...coins]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 4);

  if (gainers.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-warning" />
        <h3 className="text-sm font-semibold text-heading">Top Gainers (24h)</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gainers.map((coin, i) => (
          <TopMoverCard key={coin.id} coin={coin} rank={i + 1} />
        ))}
      </div>
    </div>
  );
};

export default TopMovers;