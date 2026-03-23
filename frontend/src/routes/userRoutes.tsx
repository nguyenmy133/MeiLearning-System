import { Route, Navigate } from "react-router-dom";
import { RoleRoute } from "@/features/shared/auth/guards";
import { lazyNamed } from "./LazyWrapper";

// ── Layout (loaded eagerly since it's the shell) ─────────────────
import { UserLayout } from "@/features/user/UserLayout";

// ── Lazy-loaded pages ────────────────────────────────────────────
const UserDashboard = lazyNamed(
  () => import("@/features/user/dashboard/pages/UserDashboard"),
  "UserDashboard",
);
// CheckInPage removed — insecure, bypass QR. Use qr-check-in instead.
const CheckInTokenPage = lazyNamed(
  () => import("@/features/user/attendance/pages/CheckInTokenPage"),
  "CheckInTokenPage",
);
const MyClassesPage = lazyNamed(
  () => import("@/features/user/classes/pages/MyClassesPage"),
  "MyClassesPage",
);
const SchedulePage = lazyNamed(
  () => import("@/features/user/schedule/pages/SchedulePage"),
  "SchedulePage",
);
const AttendancePage = lazyNamed(
  () => import("@/features/user/attendance/pages/AttendancePage"),
  "AttendancePage",
);
const DocumentsPage = lazyNamed(
  () => import("@/features/user/documents/pages/DocumentsPage"),
  "DocumentsPage",
);
const ExamList = lazyNamed(
  () => import("@/features/user/exam/pages/ExamList"),
  "ExamList",
);
const ExamTaking = lazyNamed(
  () => import("@/features/user/exam/pages/ExamTaking"),
  "ExamTaking",
);
const ExamResult = lazyNamed(
  () => import("@/features/user/exam/pages/ExamResult"),
  "ExamResult",
);
const ExamReview = lazyNamed(
  () => import("@/features/user/exam/pages/ExamReview"),
  "ExamReview",
);
const TuitionPage = lazyNamed(
  () => import("@/features/user/tuition/pages/TuitionPage"),
  "TuitionPage",
);
const LeavePage = lazyNamed(
  () => import("@/features/user/leave/pages/LeavePage"),
  "LeavePage",
);
const UserGradesPage = lazyNamed(
  () => import("@/features/user/grade/pages/UserGradesPage"),
  "UserGradesPage",
);
const ProfilePage = lazyNamed(
  () => import("@/features/user/profile/pages/ProfilePage"),
  "ProfilePage",
);
const GamesPage = lazyNamed(
  () => import("@/features/user/games/pages/GamesPage"),
  "GamesPage",
);
const NotificationsPage = lazyNamed(
  () => import("@/features/user/notifications/pages/NotificationsPage"),
  "NotificationsPage",
);

// ── Route definitions ────────────────────────────────────────────
export function userRoutes() {
  return (
    <Route
      path="/user"
      element={
        <RoleRoute allowRoles={["student"]}>
          <UserLayout />
        </RoleRoute>
      }
    >
      <Route path="dashboard" element={<UserDashboard />} />
      <Route path="classes" element={<MyClassesPage />} />
      <Route path="check-in" element={<Navigate to="/user/dashboard" replace />} />
      <Route path="qr-check-in" element={<CheckInTokenPage />} />
      <Route path="schedule" element={<Navigate to="/user/dashboard" replace />} />
      <Route path="attendance" element={<Navigate to="/user/dashboard" replace />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="exams" element={<ExamList />} />
      <Route path="exam-taking" element={<ExamTaking />} />
      <Route path="exam-result" element={<ExamResult />} />
      <Route path="exam-review" element={<ExamReview />} />
      <Route path="tuition" element={<TuitionPage />} />
      <Route path="leave" element={<LeavePage />} />
      <Route path="grades" element={<UserGradesPage />} />
      <Route path="games" element={<GamesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  );
}
