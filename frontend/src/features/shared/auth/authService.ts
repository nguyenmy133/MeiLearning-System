import { readStoredUser } from "./storage";
import type { AuthUser } from "./types";

export interface CurrentUser extends AuthUser {}

const FALLBACK_TEACHER_USER: CurrentUser = {
  id: 1,
  name: "Teacher Demo",
  role: "teacher",
  email: "teacher@meilearning.vn",
};

function getEffectiveUser(): CurrentUser {
  return readStoredUser() ?? FALLBACK_TEACHER_USER;
}

export const authService = {
  getCurrentUser(): CurrentUser {
    return getEffectiveUser();
  },

  getCurrentTeacherId(): number {
    const user = this.getCurrentUser();
    return user.role === "teacher" ? user.id : FALLBACK_TEACHER_USER.id;
  },

  getCurrentRole(): CurrentUser["role"] {
    return this.getCurrentUser().role;
  },

  isTeacher(): boolean {
    return this.getCurrentRole() === "teacher";
  },
};
