import type { AuthUser } from "./types";

export const AUTH_USER_STORAGE_KEY = "user";
// AUTH_TOKEN_STORAGE_KEY đã bị loại bỏ — access token lưu trong memory (xem api-client.ts)

function isRole(value: unknown): value is AuthUser["role"] {
  return value === "admin" || value === "teacher" || value === "student";
}

export function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed.id !== "number" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      !isRole(parsed.role)
    ) {
      return null;
    }
    return { id: parsed.id, name: parsed.name, email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

export function writeStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  // Chỉ xoá user info — access token đã ở memory (tự mất), refresh token ở cookie (xoá bởi BE)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
