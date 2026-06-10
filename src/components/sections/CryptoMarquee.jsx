import { useState, useEffect } from 'react';
import MarqueeComponent from 'react-fast-marquee';

const Marquee = MarqueeComponent.default || MarqueeComponent;

const CryptoMarquee = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const coinIds = 'bitcoin,tether,ethereum,solana,dogecoin,cardano,chainlink';

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        );
        
        if (!response.ok) throw new Error('Failed to fetch crypto data');

        const data = await response.json();
        setCoins(data);
        setLoading(false);
      } catch (err) {
        console.error("CoinGecko API Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="py-3 text-center border-y border-white/5 text-text-light text-sm font-medium">Loading ticker...</div>;
  if (error) return <div className="py-3 text-center border-y border-white/5 text-danger text-sm font-medium">Ticker unavailable</div>;

  return (
    <div className="py-5 border-y border-white/5 bg-background/50 font-body">
      <Marquee pauseOnHover={true} speed={50} gradient={false}>
        {coins.map((coin) => (
          <div key={coin.id} className="flex items-center gap-3 mx-8 text-base font-medium font-heading">
            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
            <span className="text-text-light font-semibold uppercase">{coin.symbol}</span>
            <span className="font-bold">${coin.current_price.toLocaleString()}</span>
            <span 
              className={coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}
            >
              {coin.price_change_percentage_24h > 0 ? '+' : ''}
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default CryptoMarquee;