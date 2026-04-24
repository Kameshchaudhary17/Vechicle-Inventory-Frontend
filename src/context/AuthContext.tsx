import { createContext, useContext, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "../constants";
import type { AuthResponse } from "../types/auth";

interface AuthContextValue {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });

  const login = (data: AuthResponse) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
