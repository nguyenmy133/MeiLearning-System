/**
 * Shared Auth Service
 * Single source of truth for current user identity.
 * Phase 1: returns mock data.
 * Phase 2 (BE ready): swap body to decode JWT token from localStorage/cookie.
 *
 * USAGE: authService.getCurrentTeacherId()
 * DO NOT hardcode CURRENT_TEACHER_ID = 1 anywhere else.
 */

export interface CurrentUser {
    id: number;
    name: string;
    role: "admin" | "teacher" | "student";
    email: string;
}

// ── Phase 1: Mock current user ────────────────────────────────────────────────
// Phase 2: replace with JWT decode or API call to /api/auth/me
const MOCK_CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Nguyễn Văn An",
    role: "teacher",
    email: "teacher.an@meilearning.vn",
};

export const authService = {
    /** Get full current user info */
    getCurrentUser(): CurrentUser {
        // Phase 2: decode JWT from localStorage
        // const token = localStorage.getItem("access_token");
        // return jwtDecode<CurrentUser>(token);
        return MOCK_CURRENT_USER;
    },

    /** Shortcut: get current teacher's ID */
    getCurrentTeacherId(): number {
        return this.getCurrentUser().id;
    },

    /** Shortcut: get current user's role */
    getCurrentRole(): CurrentUser["role"] {
        return this.getCurrentUser().role;
    },

    /** Check if current user is a teacher */
    isTeacher(): boolean {
        return this.getCurrentRole() === "teacher";
    },
};
