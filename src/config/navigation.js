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
      { label: "Transactions", to: "/dashboard/transactions", icon: ScrollText },
    ],
  },
  {
    section: "Funding",
    items: [
      { label: "Deposit", to: "/dashboard/deposit", icon: ArrowDownToLine },
      {
        label: "Withdraw",
        to: "/dashboard/withdraw",
        icon: ArrowUpFromLine,
        children: [
          { label: "Payment Details", to: "/dashboard/withdraw/payment-details", icon: CreditCard },
          { label: "Withdraw", to: "/", icon: Wallet}
        ],
      },
    ],
  },
  {
    section: "Market",
    items: [
      { label: "Markets", to: "/markets", icon: ChartColumn},
      {label: "Leaderboard", to: "/dashboard/leaderboard", icon: Trophy, },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Settings",
        to: "/dashboard/settings",
        icon: Settings,
      },
      {
        label: "Support",
        to: "/dashboard/support",
        icon: HeadphonesIcon,
      },
    ],
  },
];