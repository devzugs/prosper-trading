import { TrendingUp, TrendingDown, Star } from "lucide-react";
import MiniSparkline from "./MiniSparkline";

const formatPrice = (p) => {
  if (p == null) return "—";
  const decimals = p < 1 ? 6 : p < 10 ? 4 : 2;
  return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
};

const formatLarge = (n) => {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n}`;
};

const PctBadge = ({ value }) => {
  if (value == null) return <span className="text-text-muted text-xs">—</span>;
  const positive = value >= 0;
  return (
    <div className={`inline-flex items-center justify-end gap-1 text-xs font-semibold ${positive ? "text-success" : "text-danger"}`}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </div>
  );
};

const MarketRow = ({ coin, rank, index, isFavorite, onToggleFavorite }) => {
  const sparkline = coin.sparkline_in_7d?.price ?? [];
  const trendPositive = (coin.price_change_percentage_7d_in_currency ?? 0) >= 0;

  return (
    <tr
      className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition ${
        index % 2 !== 0 ? "bg-secondary/20" : ""
      }`}
    >
      {/* Rank + favorite */}
      <td className="px-5 py-4 w-16">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleFavorite(coin.id)} aria-label="Toggle favorite" className="my-transition">
            <Star size={13} className={isFavorite ? "fill-warning text-warning" : "text-text-muted hover:text-warning"} />
          </button>
          <span className="text-sm font-medium text-text-muted tabular-nums">{rank}</span>
        </div>
      </td>

      {/* Asset */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-heading">{coin.name}</p>
            <p className="text-xs text-text-muted uppercase">{coin.symbol}</p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-5 py-4 text-right">
        <span className="text-sm font-bold text-heading tabular-nums">{formatPrice(coin.current_price)}</span>
      </td>

      {/* 1h */}
      <td className="px-5 py-4 text-right hidden lg:table-cell">
        <PctBadge value={coin.price_change_percentage_1h_in_currency} />
      </td>

      {/* 24h */}
      <td className="px-5 py-4 text-right">
        <PctBadge value={coin.price_change_percentage_24h} />
      </td>

      {/* 7d */}
      <td className="px-5 py-4 text-right hidden md:table-cell">
        <PctBadge value={coin.price_change_percentage_7d_in_currency} />
      </td>

      {/* Market cap */}
      <td className="px-5 py-4 text-right hidden sm:table-cell">
        <span className="text-sm text-text-light tabular-nums">{formatLarge(coin.market_cap)}</span>
      </td>

      {/* Volume */}
      <td className="px-5 py-4 text-right hidden xl:table-cell">
        <span className="text-sm text-text-light tabular-nums">{formatLarge(coin.total_volume)}</span>
      </td>

      {/* Sparkline */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <MiniSparkline prices={sparkline} positive={trendPositive} />
      </td>
    </tr>
  );
};

export default MarketRow;