import React, { useState, useEffect } from "react";
import { Check, LoaderCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import SettingsCard from "./SettingsCard";

const CURRENCIES = ["USD - US Dollar", "EUR - Euro", "GBP - British Pound"];
const LANGUAGES = ["English", "French", "German", "Spanish", "Portuguese"];
const TIMEZONES = [
  "GMT (London)", "EST (New York)", "CET (Berlin)",
  "WAT (Lagos)", "GST (Dubai)", "SGT (Singapore)",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const Select = ({ label, value, onChange, options, disabled }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-text-light">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="my-transition w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent disabled:opacity-60 [&>option]:bg-surface"
    >
      <option value="" disabled>Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('user-preferences', { method: 'GET' });
        if (error) throw error;
        
        if (data?.preferences) {
          setPrefs(prev => ({ ...prev, ...data.preferences }));
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, []);

  const update = (field) => (e) => setPrefs((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    
    try {
      const { error } = await supabase.functions.invoke('user-preferences', {
        method: 'PATCH',
        body: prefs
      });

      if (error) throw new Error(error.message || "Failed to save preferences.");

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger animate-in fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <SettingsCard
        title="Display Preferences"
        description="Customize how figures and dates appear across your account."
      >
        {loading ? (
          <div className="flex justify-center py-6">
            <LoaderCircle className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select 
              label="Default Currency" 
              value={prefs.currency} 
              onChange={update("currency")} 
              options={CURRENCIES} 
              disabled={saving} 
            />
            <Select 
              label="Language" 
              value={prefs.language} 
              onChange={update("language")} 
              options={LANGUAGES} 
              disabled={saving} 
            />
            <Select 
              label="Timezone" 
              value={prefs.timezone} 
              onChange={update("timezone")} 
              options={TIMEZONES} 
              disabled={saving} 
            />
            <Select 
              label="Date Format" 
              value={prefs.dateFormat} 
              onChange={update("dateFormat")} 
              options={DATE_FORMATS} 
              disabled={saving} 
            />
          </div>
        )}
      </SettingsCard>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success animate-in fade-in">
            <Check size={14} />
            Preferences saved
          </span>
        )}
        <button
          type="submit"
          disabled={loading || saving}
          className="my-transition flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
};

export default PreferenceSettings;