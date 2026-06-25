import { CheckCircle, AlertCircle } from "lucide-react";

export default function AuthInput({
  icon: Icon,
  error,
  success,
  ...props
}) {
  return (
    <div className="space-y-2">
      <div
        className={`
          flex items-center gap-3 rounded-xl border bg-surface px-4 py-3
          my-transition
          ${
            error
              ? "border-danger"
              : success
              ? "border-success"
              : "border-border hover:border-accent"
          }
        `}
      >
        <Icon className="h-5 w-5 text-text-light" />

        <input
          {...props}
          className="w-full bg-transparent text-text outline-none"
        />

        {success && <CheckCircle className="h-5 w-5 text-success" />}
        {error && <AlertCircle className="h-5 w-5 text-danger" />}
      </div>

      {error && (
        <p className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}