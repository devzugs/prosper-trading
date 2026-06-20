import React from "react";
import { User, ShieldCheck, Bell, SlidersHorizontal, OctagonAlert } from "lucide-react";

export const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "danger", label: "Danger Zone", icon: OctagonAlert },
];

const SettingsTabs = ({ active, onChange }) => {
  return (
    <>
      {/* ── Desktop: vertical nav ── */}
      <nav className="hidden lg:block w-56 shrink-0">
        <ul className="space-y-1 sticky top-6">
          {SETTINGS_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            const isDanger = id === "danger";
            return (
              <li key={id}>
                <button
                  onClick={() => onChange(id)}
                  className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium my-transition
                    ${
                      isActive
                        ? isDanger
                          ? "bg-danger/10 text-danger"
                          : "bg-accent/10 text-accent"
                        : "text-text-light hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 my-transition ${
                      isActive
                        ? isDanger
                          ? "text-danger"
                          : "text-accent"
                        : "text-text-muted group-hover:text-text-light"
                    }`}
                  />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile: horizontal scroll pills ── */}
      <div className="lg:hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [&::-webkit-scrollbar]:hidden">
        {SETTINGS_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const isDanger = id === "danger";
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold my-transition
                ${
                  isActive
                    ? isDanger
                      ? "bg-danger/10 text-danger border-danger/40"
                      : "bg-accent text-secondary border-accent"
                    : "bg-surface-alt text-text-muted border-border hover:text-text-light"
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default SettingsTabs;