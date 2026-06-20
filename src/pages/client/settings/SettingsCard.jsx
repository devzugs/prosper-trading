import React from "react";

// ── Shared card shell for every settings panel ──────────────────────────────
const SettingsCard = ({ title, description, icon: Icon, children, danger = false, className = "" }) => {
  return (
    <div
      className={`bg-surface-alt rounded-xl border p-6 ${
        danger ? "border-danger/30" : "border-border"
      } ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-start gap-3 mb-5">
          {Icon && (
            <span className={`p-2 rounded-lg shrink-0 ${danger ? "bg-danger/10" : "bg-accent/10"}`}>
              <Icon size={18} className={danger ? "text-danger" : "text-accent"} />
            </span>
          )}
          <div>
            {title && <h3 className="text-base font-semibold text-heading">{title}</h3>}
            {description && (
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default SettingsCard;