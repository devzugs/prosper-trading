// ─── Static coin data ─────────────────────────────────────────────────────────
// Swap mock addresses for real ones from your backend
const Coins = [
    {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        network: "Bitcoin Network",
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        minDeposit: "0.0001 BTC",
        confirmations: 2,
    },
    {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        network: "Ethereum (ERC-20)",
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        minDeposit: "0.01 ETH",
        confirmations: 12,
    },
    {
        id: "tether",
        symbol: "USDT",
        name: "Tether",
        image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
        network: "Tron (TRC-20)", 
        address: "TR71C7656EC7ab88b098defB751B7401B5f6d8976F",
        minDeposit: "10 USDT",
        confirmations: 12,
    },
    {
        id: "binancecoin",
        symbol: "BNB",
        name: "BNB",
        image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
        network: "BNB Smart Chain (BEP-20)",
        address: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2",
        minDeposit: "0.01 BNB",
        confirmations: 15,
    },
    {
        id: "solana",
        symbol: "SOL",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        network: "Solana Network",
        address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        minDeposit: "0.01 SOL",
        confirmations: 32,
    },
];

export default Coins;