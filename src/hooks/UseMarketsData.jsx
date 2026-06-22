import { useState, useEffect } from "react";

const cache = {};
const CACHE_TTL = 60000;

const useMarketsData = (perPage = 60) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const key = `markets-${perPage}`;
    const now = Date.now();

    if (cache[key] && now - cache[key].lastFetched < CACHE_TTL) {
      setCoins(cache[key].data);
      setLastUpdated(new Date(cache[key].lastFetched));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch market data");
        return r.json();
      })
      .then((data) => {
        cache[key] = { data, lastFetched: Date.now() };
        setCoins(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [perPage]);

  return { coins, loading, error, lastUpdated };
};

export default useMarketsData;