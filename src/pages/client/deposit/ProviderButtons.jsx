const ProviderButtons = {
    paybis: {
        label: "Continue with Paybis",
        logo: "https://paybis.com/favicon.ico",
        fallbackLabel: "PB",
        href: (coin) => `https://paybis.com/buy-${coin.id}/`,
        description: "You'll be redirected to Paybis to complete your card payment securely.",
    },
};

export default ProviderButtons;