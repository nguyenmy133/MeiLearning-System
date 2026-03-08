export type UserRole = "admin" | "teacher" | "student";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  email: string;
}
