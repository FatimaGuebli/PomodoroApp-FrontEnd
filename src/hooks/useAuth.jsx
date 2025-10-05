import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error: getSessionError } = await supabase.auth.getSession();
        if (getSessionError) throw getSessionError;
        if (!mounted) return;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      // unsubscribe safely (compat for different supabase client shapes)
      if (listener && listener.subscription && typeof listener.subscription.unsubscribe === "function") {
        listener.subscription.unsubscribe();
      } else if (listener && typeof listener.unsubscribe === "function") {
        listener.unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};