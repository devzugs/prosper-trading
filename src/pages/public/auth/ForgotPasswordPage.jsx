import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, LoaderCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import AuthLayout from "./AuthLayout";
import AuthInput from "./AuthInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canResend, setCanResend] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      
      const { error: invokeError } = await supabase.functions.invoke('forgot-password', {
        body: { email }
      });

      if (invokeError) throw new Error(invokeError.message || "Failed to process request. Please try again.");

      setSubmitted(true);
      setCanResend(false);
      
      setTimeout(() => setCanResend(true), 60000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-surface-alt p-8 sm:p-10 shadow-2xl shadow-black/5">
        {!submitted ? (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-heading">
                Reset Password
              </h1>
              <p className="mt-2 text-text-light">
                Enter your email address and we'll send you a link to securely reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthInput
                icon={Mail}
                type="email"
                name="email"
                label="Email Address"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
              />

              {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-bold text-secondary transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-heading">
              Check your inbox
            </h2>
            <p className="mb-8 text-text-light">
              We've sent a secure reset link to <span className="font-medium text-text">{email}</span>. The link will expire in 15 minutes.
            </p>
            
            <button
              onClick={handleSubmit}
              disabled={!canResend || loading}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-3.5 font-bold text-heading transition-all hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {!canResend && !loading ? "Wait 60s to resend" : "Resend Email"}
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link 
            to="/login" 
            className="flex items-center gap-2 text-sm font-medium text-text-light transition-colors hover:text-heading"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}