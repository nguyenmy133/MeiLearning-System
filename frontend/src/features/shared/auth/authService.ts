import { readStoredUser } from "./storage";
import type { AuthUser } from "./types";

export interface CurrentUser extends AuthUser {}

/**
 * Auth service — đọc thông tin user đã login từ localStorage.
 * Không có fallback user giả — nếu chưa login thì trả null.
 */
export const authService = {
  getCurrentUser(): CurrentUser | null {
    return readStoredUser();
  },

  /**
   * Lấy teacherId từ user đang đăng nhập.
   * Trả về user.id nếu role = teacher, throw error nếu không phải teacher.
   */
  getCurrentTeacherId(): number {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");
    }
    if (user.role !== "teacher") {
      throw new Error("Chỉ giáo viên mới có quyền thực hiện thao tác này.");
    }
    return user.id;
  },

  getCurrentRole(): CurrentUser["role"] | null {
    return this.getCurrentUser()?.role ?? null;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  isTeacher(): boolean {
    return this.getCurrentRole() === "teacher";
  },

  isAdmin(): boolean {
    return this.getCurrentRole() === "admin";
  },

  isStudent(): boolean {
    return this.getCurrentRole() === "student";
  },
};
