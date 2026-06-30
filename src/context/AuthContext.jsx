import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Single source of truth for loading

  useEffect(() => {
    let mounted = true;

    const loadSessionAndProfile = async () => {
      // 1. Get Session
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      
      if (!activeSession) {
        if (mounted) {
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // 2. If Session exists, fetch Profile BEFORE dropping the loading flag
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeSession.user.id)
        .single();

      if (error) console.error("Failed to load profile:", error.message);

      if (mounted) {
        setSession(activeSession);
        setProfile(userProfile || null);
        setLoading(false);
      }
    };

    loadSessionAndProfile();

    // 3. Listen for future auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true); // Re-engage loading guard
      setSession(newSession);
      
      if (!newSession) {
        setProfile(null);
        setLoading(false);
      } else {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newSession.user.id)
          .single();
          
        setProfile(userProfile || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAdmin: profile?.role === "admin",

    signUp: (email, password, metadata = {}) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
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