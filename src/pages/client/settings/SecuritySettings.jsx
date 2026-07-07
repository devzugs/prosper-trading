import React, { useState } from "react";
import { Eye, EyeOff, Check, Smartphone, Monitor } from "lucide-react";
import SettingsCard from "./SettingsCard";
import Toggle from "./Toggle";

const SESSIONS = [
  { id: 1, device: "MacBook Pro · Chrome", location: "London, United Kingdom", icon: Monitor, current: true, lastActive: "Active now" },
  { id: 2, device: "iPhone 15 · Safari", location: "London, United Kingdom", icon: Smartphone, current: false, lastActive: "2 hours ago" },
  { id: 3, device: "Windows PC · Edge", location: "Manchester, United Kingdom", icon: Monitor, current: false, lastActive: "5 days ago" },
];

const PasswordField = ({ label, value, onChange, show, onToggleShow, autoComplete }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-text-light">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-text outline-none my-transition focus:border-accent"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light my-transition"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </div>
);

const SecuritySettings = () => {
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);

  const updatePwd = (field) => (e) => setPwd((p) => ({ ...p, [field]: e.target.value }));
  const toggleShow = (field) => () => setShowPwd((p) => ({ ...p, [field]: !p[field] }));

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdError("Please fill in all password fields.");
      return;
    }
    if (pwd.next.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setPwdError("");
    setPwdSaved(true);
    setPwd({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwdSaved(false), 2500);
  };

  const revokeSession = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      <SettingsCard title="Change Password" description="Use a strong password you don't use elsewhere.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <PasswordField
            label="Current Password"
            value={pwd.current}
            onChange={updatePwd("current")}
            show={showPwd.current}
            onToggleShow={toggleShow("current")}
            autoComplete="current-password"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField
              label="New Password"
              value={pwd.next}
              onChange={updatePwd("next")}
              show={showPwd.next}
              onToggleShow={toggleShow("next")}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm New Password"
              value={pwd.confirm}
              onChange={updatePwd("confirm")}
              show={showPwd.confirm}
              onToggleShow={toggleShow("confirm")}
              autoComplete="new-password"
            />
          </div>

          {pwdError && <p className="text-xs font-medium text-danger">{pwdError}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            {pwdSaved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                <Check size={14} />
                Password updated
              </span>
            )}
            <button
              type="submit"
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light"
            >
              Update Password
            </button>
          </div>
        </form>
      </SettingsCard>

      <SettingsCard title="Login Alerts">
        <Toggle
          id="loginalerts"
          checked={loginAlerts}
          onChange={setLoginAlerts}
          label="Email me on new sign-ins"
          description="Get notified whenever your account is accessed from a new device or location."
        />
      </SettingsCard>

      <SettingsCard title="Active Sessions" description="Devices currently signed in to your account.">
        <ul className="divide-y divide-border/60">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <span className="bg-surface p-2.5 rounded-lg shrink-0">
                <s.icon size={16} className="text-text-light" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-heading truncate">{s.device}</p>
                  {s.current && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-success/10 text-success shrink-0">
                      This device
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {s.location} · {s.lastActive}
                </p>
              </div>

              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="shrink-0 text-xs font-semibold text-danger hover:text-danger/80 my-transition"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}

          {sessions.length === 0 && (
            <li className="py-6 text-center text-sm text-text-muted">No other active sessions.</li>
          )}
        </ul>
      </SettingsCard>
    </div>
  );
};

export default SecuritySettings;
