import React from "react";
import useCryptoData from "../../../hooks/UseCryptoData";
import { TrendingUp, TrendingDown } from "lucide-react";

const LiveMarket = () => {
    // I added two assets to your string here just to test the 6-column density. Revert if needed.
    const { coins, loading, error } = useCryptoData('bitcoin,ethereum,solana,binancecoin,ripple,cardano');

    if (loading) return <div className="p-6 text-center text-text-muted text-sm">Loading prices…</div>;
    if (error) return <div className="p-6 text-center text-danger text-sm">Failed to load</div>;
    
    return (
        // Adjusted padding to align strictly with the global container edges
        <div className="px-6 mb-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {coins.map((coin) => (
                    <div 
                        key={coin.id} 
                        className="bg-surface-alt rounded-lg p-2.5 border border-border hover:border-accent/40 my-transition"
                    >
                        {/* Top Row: Asset Identity & Delta */}
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <img 
                                    src={coin.image} 
                                    alt={coin.name} 
                                    className="w-5 h-5 rounded-full"
                                />
                                <p className="text-xs font-bold text-heading uppercase">{coin.symbol}</p>
                            </div>
                            
                            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
                                coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'
                            }`}>
                                {coin.price_change_percentage_24h >= 0 ? (
                                    <TrendingUp size={10} strokeWidth={3} />
                                ) : (
                                    <TrendingDown size={10} strokeWidth={3} />
                                )}
                                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                            </div>
                        </div>
                        
                        {/* Bottom Row: Formatted Price */}
                        <div>
                            <p className="text-sm font-bold text-heading">
                                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Minimal Footer */}
            <div className="text-right mt-1.5">
                <span className="text-[10px] text-text-muted font-medium">Updates every 60s</span>
            </div>
        </div>
    )
}

export default LiveMarket;