import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, LoaderCircle } from "lucide-react";

import AuthLayout from "./AuthLayout";
import AuthInput from "./AuthInput";

export default function LoginPage() {
  const { signIn } = useAuth(); // Adjust this to `login` if that is what your AuthContext exports
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when the user starts typing again
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      
      // Call your actual authentication logic
      const { data, error: authError } = await signIn(formData.email, formData.password);

      if (authError) {
        setError(authError.message || "Invalid login credentials. Please try again.");
        return;
      }

      // Successful login! Redirect to the dashboard
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-surface-alt p-8 sm:p-10 shadow-2xl shadow-black/5">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-heading">
            Welcome Back
          </h1>
          <p className="mt-2 text-text-light">
            Access your secure investment dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            icon={Mail}
            type="email"
            name="email"
            label="Email Address"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <AuthInput
            icon={Lock}
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-bold text-secondary transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 disabled:pointer-events-none disabled:opacity-70"
          >
            {submitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
            {submitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-light">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-accent transition-colors hover:text-accent-light">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}