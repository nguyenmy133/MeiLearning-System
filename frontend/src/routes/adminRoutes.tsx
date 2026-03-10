import { Route } from "react-router-dom";
import { RoleRoute } from "@/features/shared/auth/guards";
import { lazyNamed } from "./LazyWrapper";

// ── Layout (loaded eagerly since it's the shell) ─────────────────
import { AdminLayout } from "@/features/admin/AdminLayout";

// ── Lazy-loaded pages ────────────────────────────────────────────
const AdminDashboard = lazyNamed(
  () => import("@/features/admin/dashboard/pages/AdminDashboard"),
  "AdminDashboard",
);
const QRSettingsPage = lazyNamed(
  () => import("@/features/admin/qr-settings/pages/QRSettingsPage"),
  "QRSettingsPage",
);
const AdminTeachersPage = lazyNamed(
  () => import("@/features/admin/teachers/pages/AdminTeachersPage"),
  "AdminTeachersPage",
);
const AdminStudentsPage = lazyNamed(
  () => import("@/features/admin/students/pages/AdminStudentsPage"),
  "AdminStudentsPage",
);
const AdminSubjectsPage = lazyNamed(
  () => import("@/features/admin/subjects/pages/AdminSubjectsPage"),
  "AdminSubjectsPage",
);
const AdminClassesPage = lazyNamed(
  () => import("@/features/admin/classes/pages/AdminClassesPage"),
  "AdminClassesPage",
);
const AdminSchedulePage = lazyNamed(
  () => import("@/features/admin/schedule/pages/AdminSchedulePage"),
  "AdminSchedulePage",
);
const AdminAttendancePage = lazyNamed(
  () => import("@/features/admin/attendance/pages/AdminAttendancePage"),
  "AdminAttendancePage",
);
const AdminTuitionPage = lazyNamed(
  () => import("@/features/admin/tuition/pages/AdminTuitionPage"),
  "AdminTuitionPage",
);
const AdminRescheduleApprovalPage = lazyNamed(
  () => import("@/features/admin/reschedule/pages/AdminRescheduleApprovalPage"),
  "AdminRescheduleApprovalPage",
);
const AdminFacilitiesPage = lazyNamed(
  () => import("@/features/admin/facilities/pages/AdminFacilitiesPage"),
  "AdminFacilitiesPage",
);
const AdminReportsPage = lazyNamed(
  () => import("@/features/admin/reports/pages/AdminReportsPage"),
  "AdminReportsPage",
);
const AdminNotificationsPage = lazyNamed(
  () => import("@/features/admin/notifications/pages/AdminNotificationsPage"),
  "AdminNotificationsPage",
);
const AdminProfilePage = lazyNamed(
  () => import("@/features/admin/profile/pages/AdminProfilePage"),
  "AdminProfilePage",
);

// ── Route definitions ────────────────────────────────────────────
export function adminRoutes() {
  return (
    <Route
      path="/admin"
      element={
        <RoleRoute allowRoles={["admin"]}>
          <AdminLayout />
        </RoleRoute>
      }
    >
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="qr-settings" element={<QRSettingsPage />} />
      <Route path="teachers" element={<AdminTeachersPage />} />
      <Route path="students" element={<AdminStudentsPage />} />
      <Route path="subjects" element={<AdminSubjectsPage />} />
      <Route path="classes" element={<AdminClassesPage />} />
      <Route path="schedule" element={<AdminSchedulePage />} />
      <Route path="attendance" element={<AdminAttendancePage />} />
      <Route path="tuition" element={<AdminTuitionPage />} />
      <Route path="reschedule-approval" element={<AdminRescheduleApprovalPage />} />
      <Route path="facilities" element={<AdminFacilitiesPage />} />
      <Route path="reports" element={<AdminReportsPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="profile" element={<AdminProfilePage />} />
    </Route>
  );
}
