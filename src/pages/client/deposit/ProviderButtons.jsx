// ─── Provider button configs ──────────────────────────────────────────────────
const ProviderButtons = {
    paybis: {
        label: "Continue with Paybis",
        logo: "https://paybis.com/favicon.ico",
        fallbackLabel: "PB",
        href: (coin) => `https://paybis.com/buy-${coin.id}/`,
        description: "You'll be redirected to Paybis to complete your card payment securely.",
    },
    moonpay: {
        label: "Continue with MoonPay",
        logo: "https://www.moonpay.com/favicon.ico",
        fallbackLabel: "MP",
        href: (coin) => `https://buy.moonpay.com/?defaultCurrencyCode=${coin.symbol}`,
        description: "You'll be redirected to MoonPay to complete your bank transfer.",
    },
};

export default ProviderButtons;