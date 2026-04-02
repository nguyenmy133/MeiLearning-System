import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRoleHomePath } from "./role-utils";
import { clearStoredSession, readStoredUser, writeStoredUser } from "./storage";
import { apiClient, setInMemoryToken } from "@/lib/api-client";
import type { AuthUser, UserRole } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true trong khi đang khôi phục session khi load trang
  login: (user: AuthUser, accessToken: string) => void;
  logout: () => Promise<void>;
  homePath: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Khôi phục session khi trang được load/refresh.
   * Nếu còn user info trong localStorage → thử refresh để lấy access token mới.
   * Nếu refresh thất bại (cookie hết hạn) → clear session, user phải login lại.
   */
  useEffect(() => {
    const storedUser = readStoredUser();
    if (!storedUser) {
      setIsInitializing(false);
      return;
    }

    apiClient
      .post<unknown, { data?: { accessToken?: string }; accessToken?: string }>("/auth/refresh")
      .then((res: any) => {
        const accessToken: string = res?.data?.accessToken ?? res?.accessToken;
        if (accessToken) {
          setInMemoryToken(accessToken);
          setUser(storedUser);
        } else {
          clearStoredSession();
        }
      })
      .catch(() => {
        // Refresh token hết hạn hoặc không tồn tại — clear session
        clearStoredSession();
      })
      .finally(() => setIsInitializing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((nextUser: AuthUser, accessToken: string) => {
    setUser(nextUser);
    writeStoredUser(nextUser);
    setInMemoryToken(accessToken); // lưu vào memory, không phải localStorage
  }, []);

  const logout = useCallback(async () => {
    try {
      // Gọi BE để revoke refresh token và xoá cookie
      await apiClient.post("/auth/logout");
    } catch {
      // Bỏ qua lỗi network khi logout — vẫn clear local state
    } finally {
      setUser(null);
      setInMemoryToken(null);
      clearStoredSession();
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    return {
      user,
      role,
      isAuthenticated: !!user,
      isInitializing,
      login,
      logout,
      homePath: role ? getRoleHomePath(role) : "/",
    };
  }, [user, isInitializing, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
