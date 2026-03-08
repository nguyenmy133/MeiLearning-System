import type { UserRole } from "./types";

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    default:
      return "/user/dashboard";
  }
}
