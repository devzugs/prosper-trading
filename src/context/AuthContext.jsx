import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);       // true until first session check resolves
  const [profileLoading, setProfileLoading] = useState(false);

  // 1. Get the existing session on first load, then keep listening for changes
  //    (sign in, sign out, token refresh all fire onAuthStateChange).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 2. Whenever the session's user changes, fetch their profile row (for role/kyc/etc).
  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load profile:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
        setProfileLoading(false);
      });
  }, [session?.user?.id]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading: loading || profileLoading,
    isAdmin: profile?.role === "admin",

    signUp: (email, password, metadata = {}) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }, // becomes raw_user_meta_data, read by the DB trigger
      }),

    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),

    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}