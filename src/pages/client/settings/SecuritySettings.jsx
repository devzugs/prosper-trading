import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, Smartphone, Monitor, LoaderCircle } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import SettingsCard from "./SettingsCard";
import Toggle from "./Toggle";

const PasswordField = ({ label, value, onChange, show, onToggleShow, autoComplete, disabled }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-text-light">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-text outline-none my-transition focus:border-accent disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onToggleShow}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light my-transition disabled:opacity-60"
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
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const [loginAlerts, setLoginAlerts] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const updatePwd = (field) => (e) => setPwd((p) => ({ ...p, [field]: e.target.value }));
  const toggleShow = (field) => () => setShowPwd((p) => ({ ...p, [field]: !p[field] }));

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // C2 FIX: invoke() always sends POST; use action field to signal intent
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('auth-sessions', {
          body: { action: 'list' }
        });
        if (!sessionError) {
          setSessions(sessionData?.sessions || []);
        }

        const { data: prefData, error: prefError } = await supabase.functions.invoke('user-preferences', {
          body: { action: 'get' }
        });
        if (!prefError) {
          // C5 FIX: DB column is login_alerts (snake_case), read the right key
          setLoginAlerts(prefData?.preferences?.login_alerts ?? true);
        }
      } catch (err) {
        console.error("Failed to load security settings:", err);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError("");

    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdError("Please fill in all password fields.");
      return;
    }
    if (pwd.next.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(pwd.next)) {
      setPwdError("New password must contain at least one uppercase letter and one number.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("New password and confirmation do not match.");
      return;
    }
    if (pwd.current === pwd.next) {
      setPwdError("New password must be different from the current password.");
      return;
    }

    try {
      setPwdLoading(true);
      
      const { error } = await supabase.functions.invoke('change-password', {
        body: {
          currentPassword: pwd.current,
          newPassword: pwd.next,
          newPasswordConfirm: pwd.confirm
        }
      });

      if (error) throw new Error(error.message || "Failed to update password.");

      setPwdSaved(true);
      setPwd({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwdSaved(false), 2500);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleToggleAlerts = async (checked) => {
    try {
      setAlertsLoading(true);
      
      // C2 FIX: use action field; C5 FIX: send snake_case key to match DB column
      const { error } = await supabase.functions.invoke('user-preferences', {
        body: { action: 'update', login_alerts: checked }
      });

      if (error) throw new Error("Failed to update preferences");
      setLoginAlerts(checked);
    } catch (err) {
      console.error("Failed to toggle login alerts:", err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const revokeSession = async (id) => {
    try {
      // C2 FIX: dynamic function name was a 404; pass sessionId in body instead
      const { error } = await supabase.functions.invoke('auth-sessions', {
        body: { action: 'revoke', sessionId: id }
      });

      if (error) throw new Error("Failed to revoke session");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to revoke session:", err);
    }
  };

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
            disabled={pwdLoading}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PasswordField
              label="New Password"
              value={pwd.next}
              onChange={updatePwd("next")}
              show={showPwd.next}
              onToggleShow={toggleShow("next")}
              autoComplete="new-password"
              disabled={pwdLoading}
            />
            <PasswordField
              label="Confirm New Password"
              value={pwd.confirm}
              onChange={updatePwd("confirm")}
              show={showPwd.confirm}
              onToggleShow={toggleShow("confirm")}
              autoComplete="new-password"
              disabled={pwdLoading}
            />
          </div>

          <div className="rounded-lg bg-surface p-3 text-xs text-text-muted">
            <p className="mb-2 font-semibold">Password requirements:</p>
            <ul className="space-y-1 pl-1">
              <li className={pwd.next.length >= 8 ? "text-success" : ""}>• At least 8 characters</li>
              <li className={/(?=.*[A-Z])/.test(pwd.next) ? "text-success" : ""}>• At least one uppercase letter</li>
              <li className={/(?=.*[0-9])/.test(pwd.next) ? "text-success" : ""}>• At least one number</li>
            </ul>
          </div>

          {pwdError && <p className="text-sm font-medium text-danger">{pwdError}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            {pwdSaved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success animate-in fade-in">
                <Check size={14} />
                Password updated
              </span>
            )}
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pwdLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {pwdLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </SettingsCard>

      <SettingsCard title="Login Alerts">
        <Toggle
          id="loginalerts"
          checked={loginAlerts}
          onChange={handleToggleAlerts}
          disabled={alertsLoading}
          label="Email me on new sign-ins"
          description="Get notified whenever your account is accessed from a new device or location."
        />
      </SettingsCard>

      <SettingsCard title="Active Sessions" description="Devices currently signed in to your account.">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-6 text-text-muted">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <span className="shrink-0 rounded-lg bg-surface p-2.5">
                  {s.deviceType === "mobile" ? (
                    <Smartphone size={16} className="text-text-light" />
                  ) : (
                    <Monitor size={16} className="text-text-light" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-heading">
                      {s.browser} · {s.os}
                    </p>
                    {s.isCurrent && (
                      <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {s.location} · {s.lastActive}
                  </p>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="shrink-0 text-xs font-semibold text-danger my-transition hover:text-danger/80"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}

            {sessions.length === 0 && (
              <li className="py-6 text-center text-sm text-text-muted">
                No other active sessions found.
              </li>
            )}
          </ul>
        )}
      </SettingsCard>
    </div>
  );
};

export default SecuritySettings;