import { useState, useEffect } from "react";

const cache = {};

const useCryptoData = (ids) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const now = Date.now();
    
    // Check if valid cache exists for THESE specific ids
    if (cache[ids] && now - cache[ids].lastFetched < 60000) {
      setCoins(cache[ids].data);
      setLastUpdated(new Date(cache[ids].lastFetched));
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Removed the literal "..." so "tether" doesn't become "tether..."
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then(data => {
        // Save to cache under the specific 'ids' key
        cache[ids] = { data, lastFetched: Date.now() };
        
        setCoins(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [ids]); // Added ids to dependency array so it refetches if the requested coins change

  // Return all variables expected by LiveMarket.jsx
  return { coins, loading, error, lastUpdated };
}

export default useCryptoData;