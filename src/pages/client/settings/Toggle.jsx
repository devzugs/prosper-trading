import React from "react";

// ── Reusable on/off switch used across Settings ────────────────────────────
const Toggle = ({ id, checked, onChange, label, description, disabled = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <label htmlFor={id} className={`min-w-0 pr-4 ${disabled ? "" : "cursor-pointer"}`}>
        <p className="text-sm font-medium text-heading">{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </label>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border my-transition
          ${checked ? "bg-accent border-accent" : "bg-surface border-border"}
          disabled:cursor-not-allowed
        `}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm my-transition
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;