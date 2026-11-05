export function formatReferralMoney(amounts = {}) {
  const entries = Object.entries(amounts);
  if (!entries.length) return "0.00";
  return entries.map(([currency, amount]) => `${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: ["BTC", "ETH"].includes(currency) ? 8 : 2,
  })} ${currency}`).join(" · ");
}
