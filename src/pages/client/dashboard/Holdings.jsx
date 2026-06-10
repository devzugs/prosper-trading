import React from "react";
import useCryptoData from "../../../hooks/UseCryptoData";

const Holdings = () => {
    const { coins, loading, error } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana,usd-coin");

    if (loading) return <div className="p-6 text-center text-text-muted">Loading holdings...</div>;
    if (error) return <div className="p-6 text-center text-danger">Failed to load crypto data.</div>;

    return (
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6 w-full max-w-lg">
            <h2 className="lg:hidden text-xl font-bold text-heading mb-4 font-heading">Your Holdings</h2>
            
            <div className="flex flex-col">
                {coins.map((coin) => (
                    <div 
                        key={coin.id} 
                        className="grid grid-cols-3 gap-4 items-center py-3 px-2 border-b border-border/50 last:border-0 hover:bg-surface my-transition rounded-lg"
                    >
                        
                        {/* Column 1: Coin Identity (Left) */}
                        <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="text-sm font-bold text-heading uppercase">{coin.symbol}</p>
                                <p className="text-xs text-text-muted capitalize">{coin.name}</p>
                            </div>
                        </div>

                        {/* Column 2: Market Price & Delta (Right) */}
                        <div className="text-right pr-2">
                            <p className="text-sm font-bold text-heading">
                                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                        </div>

                        {/* Column 3: User Balance (Right) */}
                        <div className="text-right">
                            <p className="text-sm font-bold text-heading">$0.00</p>
                            <p className="text-xs text-text-muted">0 {coin.symbol.toUpperCase()}</p>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Holdings;