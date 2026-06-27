import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({ icon: Icon, type = "text", label, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-light ml-1">
          {label}
        </label>
      )}
      <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-all duration-300 focus-within:border-accent focus-within:bg-surface-alt focus-within:ring-4 focus-within:ring-accent/10 hover:border-accent/50">
        {Icon && (
          <Icon className="h-5 w-5 text-text-light transition-colors group-focus-within:text-accent" />
        )}

        <input
          type={inputType}
          className="w-full bg-transparent text-text outline-none placeholder:text-text-light/50"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-light transition-colors hover:text-accent focus:outline-none"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}