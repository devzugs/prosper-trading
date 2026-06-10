import React from "react";
import useCryptoData from "../../../hooks/UseCryptoData";

const Holdings = () => {
    const { coins, loading, error } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana");

    if (loading) return <div className="p-6 text-center text-text-muted">Loading holdings...</div>;
    if (error) return <div className="p-6 text-center text-danger">Failed to load crypto data.</div>;

    return (
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6 w-full max-w-lg">
            <h2 className="lg:hidden text-xl font-bold text-heading mb-4 font-heading">Your Holdings</h2>
            
            <div className="flex flex-col">
                {coins.map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                        
                        {/* Left Side: Coin Identity */}
                        <div className="flex items-center gap-3 w-1/3">
                            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-bold text-heading uppercase text-base">{coin.symbol}</span>
                                <span className="text-sm text-text-muted capitalize">{coin.name}</span>
                            </div>
                        </div>

                        {/* Middle: Market Price & 24h Change */}
                        <div className="flex flex-col items-end w-1/3 pr-4">
                            <span className="font-semibold text-heading">${coin.current_price.toLocaleString()}</span>
                            <span 
                                className={`text-sm font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}
                            >
                                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                            </span>
                        </div>

                        {/* Right Side: User's Holding Balance */}
                        <div className="flex flex-col items-end text-right w-1/3">
                            <span className="font-bold text-heading text-lg">$0.00</span>
                            <span className="text-sm text-text-muted font-medium">0 {coin.symbol.toUpperCase()}</span>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Holdings;