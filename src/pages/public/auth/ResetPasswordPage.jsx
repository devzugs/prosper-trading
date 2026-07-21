import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import AuthInput from "./AuthInput";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Failsafe: If a user lands here without a token, throw a hard error.
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/(?=.*[0-9])/.test(password)) return "Password must contain at least one number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }

    const strengthError = validatePassword(formData.newPassword);
    if (strengthError) {
      setError(strengthError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          newPasswordConfirm: formData.confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reset password. Your token may have expired.");
      }

      setSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-surface-alt p-8 sm:p-10 shadow-2xl shadow-black/5">
        {success ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-heading">
              Password Reset Complete
            </h2>
            <p className="mb-8 text-text-light">
              Your password has been securely updated. Redirecting you to login...
            </p>
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-heading">
                Create New Password
              </h1>
              <p className="mt-2 text-text-light">
                Please enter a strong, secure password that you don't use elsewhere.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthInput
                icon={Lock}
                type="password"
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={!token || loading}
                required
              />

              <AuthInput
                icon={Lock}
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={!token || loading}
                required
              />

              {/* Password Requirements Helper */}
              <div className="rounded-lg bg-surface p-3 text-xs text-text-muted">
                <p className="mb-1 font-semibold">Password requirements:</p>
                <ul className="space-y-1 pl-1">
                  <li className={formData.newPassword.length >= 8 ? "text-success" : ""}>• At least 8 characters</li>
                  <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? "text-success" : ""}>• At least one uppercase letter</li>
                  <li className={/(?=.*[0-9])/.test(formData.newPassword) ? "text-success" : ""}>• At least one number</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!token || loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-bold text-secondary transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {loading ? "Updating Security..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}