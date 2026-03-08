import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getRoleHomePath } from "./role-utils";
import { AUTH_TOKEN_STORAGE_KEY, clearStoredSession, readStoredUser, writeStoredUser } from "./storage";
import type { AuthUser, UserRole } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken?: string) => void;
  logout: () => void;
  homePath: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback((nextUser: AuthUser, accessToken?: string) => {
    setUser(nextUser);
    writeStoredUser(nextUser);

    if (typeof window !== "undefined") {
      if (accessToken) {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
      } else {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredSession();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    return {
      user,
      role,
      isAuthenticated: !!user,
      login,
      logout,
      homePath: role ? getRoleHomePath(role) : "/",
    };
  }, [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
