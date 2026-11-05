export function referralUsdTotal(amounts = {}, coins = []) {
  let total = 0;
  for (const [currency, value] of Object.entries(amounts)) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return null;
    if (amount === 0) continue;
    const symbol = currency.trim().toLowerCase();
    if (["usd", "usdt", "usdc", "tether", "usd-coin"].includes(symbol)) {
      total += amount;
      continue;
    }
    const coin = coins.find(c => c.symbol?.toLowerCase() === symbol || c.id?.toLowerCase() === symbol);
    const price = Number(coin?.current_price);
    if (!Number.isFinite(price) || price <= 0) return null;
    total += amount * price;
  }
  return total;
}

export const formatReferralUsd = value => `$${value.toLocaleString("en-US", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;
