// ── FAQ data grouped by category ───────────────────────────────────────────────

export const FAQ_DATA = {
  account: {
    title: "Account & Profile",
    items: [
      {
        question: "How do I update my profile information?",
        answer:
          "Navigate to Settings → Profile to update your name, email, phone, country, and bio. Changes are saved immediately.",
      },
      {
        question: "Can I change my registered email address?",
        answer:
          "Yes, you can change your email in Settings → Profile. You'll need to verify the new email address before it becomes active.",
      },
      {
        question: "How do I deactivate my account?",
        answer:
          "Go to Settings → Danger Zone and click 'Deactivate Account'. Your data will be preserved, and you can reactivate anytime by logging in again.",
      },
      {
        question: "What happens if I delete my account?",
        answer:
          "Account deletion is permanent. All your data, transaction history, and personal information will be erased and cannot be recovered.",
      },
    ],
  },
  security: {
    title: "Security & Authentication",
    items: [
    //   {
    //     question: "How do I enable two-factor authentication?",
    //     answer:
    //       "Go to Settings → Security, toggle on '2FA Authenticator App', and scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).",
    //   },
    //   {
    //     question: "What should I do if I lose access to my authenticator app?",
    //     answer:
    //       "Contact our support team immediately. We can help you regain access to your account through our recovery process.",
    //   },
      {
        question: "How do I change my password?",
        answer:
          "Go to Settings → Security → Change Password. Enter your current password, then your new password twice. Your password must be at least 8 characters long.",
      },
    //   {
    //     question: "Can I see all devices logged into my account?",
    //     answer:
    //       "Yes, go to Settings → Security → Active Sessions. You can revoke access from any device except your current one.",
    //   },
    ],
  },
  deposits: {
    title: "Deposits & Funding",
    items: [
      {
        question: "What deposit methods are available?",
        answer:
          "We support three deposit methods: Credit/Debit Card (via Paybis), Bank Transfer (via MoonPay), and direct crypto wallet transfers.",
      },
      {
        question: "How long does a deposit take to process?",
        answer:
          "Card deposits are usually instant. Bank transfers take 1-3 business days. Crypto deposits depend on network confirmation times (typically 15 minutes to 2 hours).",
      },
      {
        question: "Is there a minimum deposit amount?",
        answer:
          "Minimums vary by asset. For example, Bitcoin minimum is 0.0001 BTC, Ethereum is 0.01 ETH. Check the deposit page for your chosen asset.",
      },
      {
        question: "Are deposits secure?",
        answer:
          "Yes, all deposits use 256-bit encryption and are processed by regulated third-party providers. Your funds are secure.",
      },
    ],
  },
  trading: {
    title: "Trading & Portfolio",
    items: [
      {
        question: "How do I view my portfolio performance?",
        answer:
          "Go to Dashboard to see your portfolio value, 24H P&L, and trading history. Click on 'Portfolio Performance' for detailed charts.",
      },
      {
        question: "What investment plans are available?",
        answer:
          "We offer three plans: Starter (up to 8% monthly), Growth (up to 15% monthly), and Elite (up to 25% monthly). Each has different minimums and features.",
      },
      {
        question: "Can I switch between investment plans?",
        answer:
          "You can modify your plan once per quarter. Contact support to request a plan change.",
      },
      {
        question: "How is ROI calculated?",
        answer:
          "ROI is calculated as (Total Profit / Invested Capital) × 100. It reflects the percentage return on your initial investment.",
      },
    ],
  },
  withdrawals: {
    title: "Withdrawals",
    items: [
      {
        question: "How do I set up a withdrawal destination?",
        answer:
          "Go to Payment Details and upload your payment method (credit card, bank account, or crypto wallet). Your account must be verified before withdrawals.",
      },
      {
        question: "How long does a withdrawal take?",
        answer:
          "Processing times vary: Bank transfers take 2-5 business days, card reversals take 3-7 days, and crypto transfers depend on network confirmation (15 min - 2 hours).",
      },
      {
        question: "Is there a withdrawal limit?",
        answer:
          "Daily withdrawal limits depend on your verification level. Unverified accounts have a $1,000 daily limit. Contact support to increase your limit.",
      },
      {
        question: "Can I withdraw while I have an active investment plan?",
        answer:
          "You can withdraw profits at any time, but withdrawing from your principal may be restricted depending on your plan terms.",
      },
    ],
  },
};