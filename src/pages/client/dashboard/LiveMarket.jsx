import React from "react";
import useCryptoData from "../../../hooks/UseCryptoData";

import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";

const LiveMarket = () => {
  const { coins, loading, error, lastUpdated,  } = useCryptoData('bitcoin,ethereum,solana,binancecoin');

  if (loading) return <div className="p-6 text-center text-text-muted text-sm">Loading prices…</div>;
  if (error) return <div className="p-6 text-center text-danger text-sm">Failed to load</div>;
    return (
        <div className="p-6">
            <div className="flex justify-between p-3 border-b border-border ">
                <div className="flex gap-2 items-center">
                    <span className="text-success">
                        <Activity
                        size={15}/>
                    </span>
                    <span className="text-[14px] text-text-muted">Live Market</span>
                </div>
                <div className="flex gap-1 items-center text-success">
                    <Zap 
                    size={15}/>
                    <span className="text-xs ">Live</span>
                </div>

            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 mt-3">
                {coins.map((coin) => (
                <div key={coin.id} className="bg-secondary rounded-lg p-3 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                    <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-6 h-6 rounded-full"
                    />
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase">{coin.symbol}</p>
                        <p className="text-[10px] text-text-muted/70">{coin.name}</p>
                    </div>
                    </div>
                    <p className="text-sm font-bold text-text-primary mb-1">
                    {coin.current_price}
                    </p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                    coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                    {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp size={12} />
                    ) : (
                        <TrendingDown size={12} />
                    )}
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}% <span className="text-text-muted/60">24h</span>
                    </div>
                </div>
                ))}
            </div>

            <div className="flex justify-between items-center p-3 border-t border-border text-[11px] text-text-muted/70">
                <span>Updates every 60s</span>
            </div>
    </div>
    )
}

export default LiveMarket;
