import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  Gift,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

const SignupPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("ref");

    if (ref) {
      setReferralCode(ref);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await signUp(email, password, {
        full_name: fullName,
        referral_code: referralCode || null,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.session) {
        navigate("/dashboard", { replace: true });
      } else {
        setCheckEmail(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 font-body">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface-alt p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
            <Mail className="h-7 w-7 text-accent" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-heading">
            Check your email
          </h1>

          <p className="mt-3 text-sm text-text-light">
            We've sent a confirmation link to
          </p>

          <p className="mt-1 font-medium text-text">
            {email}
          </p>

          <p className="mt-4 text-sm text-text-light">
            Click the verification link in your inbox to activate your account.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 font-body">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-alt p-8 shadow-lg">
        <h1 className="font-heading text-3xl font-bold text-heading">
          Create Account
        </h1>

        <p className="mt-2 text-sm text-text-light">
          Start your investment journey with Prosper Trading.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-light">
              Full Name
            </label>

            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent my-transition">
              <User className="mr-3 h-5 w-5 text-text-light" />

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                aria-label="Full Name"
                placeholder="John Doe"
                className="w-full bg-transparent text-text outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-light">
              Email Address
            </label>

            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent my-transition">
              <Mail className="mr-3 h-5 w-5 text-text-light" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Email Address"
                placeholder="john@example.com"
                className="w-full bg-transparent text-text outline-none"
              />
            </div>
          </div>

          {/* Referral */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-light">
              Referral Code (Optional)
            </label>

            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent my-transition">
              <Gift className="mr-3 h-5 w-5 text-text-light" />

              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                aria-label="Referral Code"
                placeholder="Enter referral code"
                className="w-full bg-transparent text-text outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-light">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent my-transition">
              <Lock className="mr-3 h-5 w-5 text-text-light" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-label="Password"
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent text-text outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="text-text-light"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-light">
              Confirm Password
            </label>

            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-accent my-transition">
              <Lock className="mr-3 h-5 w-5 text-text-light" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
                aria-label="Confirm Password"
                placeholder="Re-enter password"
                className="w-full bg-transparent text-text outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="text-text-light"
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger bg-danger-light p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {submitting
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-light">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;