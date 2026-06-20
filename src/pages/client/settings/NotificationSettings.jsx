import React, { useState } from "react";
import { Check } from "lucide-react";
import SettingsCard from "./SettingsCard";
import Toggle from "./Toggle";

const NotificationSettings = () => {
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    sms: false,
    priceAlerts: true,
    depositConfirm: true,
    withdrawalConfirm: true,
    weeklySummary: true,
    productUpdates: false,
    marketingEmails: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Delivery Channels" description="Choose how you'd like to receive notifications.">
        <div className="divide-y divide-border/60">
          <Toggle
            id="email"
            checked={prefs.email}
            onChange={toggle("email")}
            label="Email Notifications"
            description="Receive account updates via email."
          />
          <Toggle
            id="push"
            checked={prefs.push}
            onChange={toggle("push")}
            label="Push Notifications"
            description="Receive alerts on your devices."
          />
          <Toggle
            id="sms"
            checked={prefs.sms}
            onChange={toggle("sms")}
            label="SMS Alerts"
            description="Receive text messages for critical account alerts."
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Trading & Portfolio" description="Stay informed about activity on your account.">
        <div className="divide-y divide-border/60">
          <Toggle
            id="priceAlerts"
            checked={prefs.priceAlerts}
            onChange={toggle("priceAlerts")}
            label="Price Alerts"
            description="Notify me of significant market movements."
          />
          <Toggle
            id="depositConfirm"
            checked={prefs.depositConfirm}
            onChange={toggle("depositConfirm")}
            label="Deposit Confirmations"
            description="Notify me when a deposit is credited to my account."
          />
          <Toggle
            id="withdrawalConfirm"
            checked={prefs.withdrawalConfirm}
            onChange={toggle("withdrawalConfirm")}
            label="Withdrawal Confirmations"
            description="Notify me when a withdrawal is processed."
          />
        </div>
      </SettingsCard>

      <SettingsCard title="News & Marketing">
        <div className="divide-y divide-border/60">
          <Toggle
            id="productUpdates"
            checked={prefs.productUpdates}
            onChange={toggle("productUpdates")}
            label="Product Updates"
            description="New features and platform improvements."
          />
          <Toggle
            id="marketingEmails"
            checked={prefs.marketingEmails}
            onChange={toggle("marketingEmails")}
            label="Marketing Emails"
            description="Promotions, offers, and investment insights."
          />
        </div>
      </SettingsCard>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <Check size={14} />
            Preferences saved
          </span>
        )}
        <button
          onClick={handleSave}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;