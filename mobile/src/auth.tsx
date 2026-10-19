/** BandQuest IELTS mobile — auth state (token in SecureStore). */
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getToken, setToken, onUnauthorized, User } from "./api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const d = await api.me();
      setUser(d.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    onUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
    refresh().finally(() => setLoading(false));
  }, []);

  const applySession = async (u: User, token: string) => {
    await setToken(token);
    setUser(u);
  };

  const value: AuthContextValue = {
    user,
    loading,
    refresh,
    login: async (email, password) => {
      const d = await api.login(email, password);
      await applySession(d.user, d.token);
    },
    register: async (email, password, displayName) => {
      const d = await api.register(email, password, displayName);
      await applySession(d.user, d.token);
    },
    continueAsGuest: async () => {
      const d = await api.guest();
      await applySession(d.user, d.token);
    },
    signInWithGoogle: async (idToken) => {
      const d = await api.googleMobile(idToken);
      await applySession(d.user, d.token);
    },
    logout: async () => {
      try {
        await api.logout();
      } catch {
        /* ignore */
      }
      await setToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
