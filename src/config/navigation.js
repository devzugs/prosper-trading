import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine,
  CreditCard, ScrollText, Trophy, Settings, HeadphonesIcon, ChartColumn,
  Wallet
} from "lucide-react";

// Public Links
export const PUBLIC_NAV = [
  { label: "About Us", to: "/about-us" },
  { label: "Trading", to: "/trading" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact Us", to: "/contact-us" },
];

// Authenticated  Links
export const APP_SIDEBAR_NAV = [
  {
    section: "Portfolio",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Transactions", to: "/transaction-history", icon: ScrollText },
    ],
  },
  {
    section: "Funding",
    items: [
      { label: "Deposit", to: "/deposit", icon: ArrowDownToLine },
      {
        label: "Withdraw",
        to: "/dashboard/withdraw",
        icon: ArrowUpFromLine,
        children: [
          { label: "Withdraw", to: "/", icon: Wallet},
          { label: "Payment Details", to: "/payment-details", icon: CreditCard },
        ],
      },
    ],
  },
  {
    section: "Market",
    items: [
      { label: "Markets", to: "/markets", icon: ChartColumn},
      {label: "Leaderboard", to: "/leaderboard", icon: Trophy, },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Settings",
        to: "/settings",
        icon: Settings,
      },
      {
        label: "Support",
        to: "/support",
        icon: HeadphonesIcon,
      },
    ],
  },
];