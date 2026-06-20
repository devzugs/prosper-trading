import React, { useState } from "react";
import { Check } from "lucide-react";
import SettingsCard from "./SettingsCard";

const CURRENCIES = [
  "USD - US Dollar", "EUR - Euro",
];
const LANGUAGES = ["English", "French", "German", "Spanish", "Portuguese"];
const TIMEZONES = [
  "GMT (London)", "EST (New York)", "CET (Berlin)",
  "WAT (Lagos)", "GST (Dubai)", "SGT (Singapore)",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-text-light">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent [&>option]:bg-surface"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const PreferenceSettings = () => {
  const [prefs, setPrefs] = useState({
    currency: CURRENCIES[0],
    language: LANGUAGES[0],
    timezone: TIMEZONES[0],
    dateFormat: DATE_FORMATS[0],
  });
  const [saved, setSaved] = useState(false);

  const update = (field) => (e) => setPrefs((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsCard
        title="Display Preferences"
        description="Customize how figures and dates appear across your account."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Default Currency" value={prefs.currency} onChange={update("currency")} options={CURRENCIES} />
          <Select label="Language" value={prefs.language} onChange={update("language")} options={LANGUAGES} />
          <Select label="Timezone" value={prefs.timezone} onChange={update("timezone")} options={TIMEZONES} />
          <Select label="Date Format" value={prefs.dateFormat} onChange={update("dateFormat")} options={DATE_FORMATS} />
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
          type="submit"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
};

export default PreferenceSettings;