import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-react";

import AuthLayout from "./AuthLayout";
import AuthInput from "./AuthInput";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-surface-alt p-8 shadow-xl">
        <h1 className="font-heading text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-2 text-text-light">
          Access your investment dashboard.
        </p>

        <form className="mt-8 space-y-5">
          <AuthInput
            icon={Mail}
            type="email"
            placeholder="Email Address"
            aria-label="Email Address"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-accent">
              <Lock className="h-5 w-5 text-text-light" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                className="w-full bg-transparent outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-text-light" />
                ) : (
                  <Eye className="h-5 w-5 text-text-light" />
                )}
              </button>
            </div>
          </div>

          <button
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-secondary hover:bg-accent-light disabled:opacity-70"
          >
            {submitting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {submitting ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-light">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-accent"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}