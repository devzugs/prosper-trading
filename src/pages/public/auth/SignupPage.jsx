import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { User, Mail, Lock, Gift, LoaderCircle, Phone, Globe } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import COUNTRIES from "../../../constants/countries";
import AuthLayout from "./AuthLayout";
import AuthInput from "./AuthInput";



export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "GB", // Defaulting to NG based on typical usage, adjust as needed
    referralCode: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("ref");
    if (ref) setFormData(prev => ({ ...prev, referralCode: ref }));
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      return "Please fill in all required fields.";
    }
    
    // Phone validation using libphonenumber-js
    try {
      if (!isValidPhoneNumber(formData.phone, formData.country)) {
        return "Please enter a valid phone number for the selected country.";
      }
    } catch (err) {
      return "Invalid phone number format.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      
      // Format phone to strict E.164 before sending to backend
      const formattedPhone = parsePhoneNumber(formData.phone, formData.country).number;

      const { data, error: authError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formattedPhone,
        country: formData.country,
        referral_code: formData.referralCode || null,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data?.session) {
        navigate("/dashboard", { replace: true });
      } else {
        setCheckEmail(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 font-body">
        <div className="w-full max-w-md animate-pop-out rounded-2xl border border-border bg-surface-alt p-8 text-center shadow-2xl shadow-black/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-heading">Check your email</h1>
          <p className="mt-3 text-text-light">We've sent a confirmation link to</p>
          <p className="mt-1 font-semibold text-text">{formData.email}</p>
          <p className="mt-4 text-sm text-text-light">Click the verification link in your inbox to activate your account.</p>
          <Link
            to="/login"
            className="mt-8 inline-block w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-secondary transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-surface-alt p-8 sm:p-10 shadow-2xl shadow-black/5">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-heading">
            Create Account
          </h1>
          <p className="mt-2 text-text-light">
            Start your investment journey with Prosper.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput icon={User} name="fullName" value={formData.fullName} onChange={handleChange} label="Full Name" placeholder="John Doe" required />
          <AuthInput icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} label="Email Address" placeholder="johndoe01@gmail.com" required />
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-text-light">Country</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <Globe className="h-5 w-5" />
                </div>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-heading transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                >
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-2">
              <AuthInput icon={Phone} name="phone" type="tel" value={formData.phone} onChange={handleChange} label="Phone Number" placeholder="1234 567 890" required />
            </div>
          </div>

          <AuthInput icon={Gift} name="referralCode" value={formData.referralCode} onChange={handleChange} label="Referral Code (Optional)" placeholder="Enter code" />
          <AuthInput icon={Lock} name="password" type="password" value={formData.password} onChange={handleChange} label="Password" placeholder="Min. 8 characters" required />
          <AuthInput icon={Lock} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} label="Confirm Password" placeholder="Re-enter password" required />

          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-bold text-secondary transition-all hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 disabled:pointer-events-none disabled:opacity-70"
          >
            {submitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-light">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent transition-colors hover:text-accent-light">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}