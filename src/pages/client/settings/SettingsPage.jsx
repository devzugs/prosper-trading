import React, { useState } from "react";
import SettingsTabs from "./SettingsTabs";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";
import PreferenceSettings from "./PreferenceSettings";
import DangerZoneSettings from "./DangerZoneSettings";

const PANELS = {
  profile: ProfileSettings,
  security: SecuritySettings,
  notifications: NotificationSettings,
  preferences: PreferenceSettings,
  danger: DangerZoneSettings,
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const ActivePanel = PANELS[activeTab] ?? ProfileSettings;

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your profile, security, and account preferences.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="p-6 pt-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <SettingsTabs active={activeTab} onChange={setActiveTab} />

          <div key={activeTab} className="flex-1 min-w-0 animate-[fade-up_0.4s_ease_forwards]">
            <ActivePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;