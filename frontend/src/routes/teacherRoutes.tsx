import { Route } from "react-router-dom";
import { RoleRoute } from "@/features/shared/auth/guards";
import { lazyNamed } from "./LazyWrapper";

// ── Layout (loaded eagerly since it's the shell) ─────────────────
import { TeacherLayout } from "@/features/teacher/TeacherLayout";

// ── Lazy-loaded pages ────────────────────────────────────────────
const TeacherDashboard = lazyNamed(
  () => import("@/features/teacher/dashboard/pages/TeacherDashboard"),
  "TeacherDashboard",
);
const TeacherAttendancePage = lazyNamed(
  () => import("@/features/teacher/attendance/pages/TeacherAttendancePage"),
  "TeacherAttendancePage",
);
const TeacherSchedulePage = lazyNamed(
  () => import("@/features/teacher/schedule/pages/TeacherSchedulePage"),
  "TeacherSchedulePage",
);
const TeacherClassesPage = lazyNamed(
  () => import("@/features/teacher/classes/pages/TeacherClassesPage"),
  "TeacherClassesPage",
);
const TeacherDocumentsPage = lazyNamed(
  () => import("@/features/teacher/documents/pages/TeacherDocumentsPage"),
  "TeacherDocumentsPage",
);
const TeacherExamManagement = lazyNamed(
  () => import("@/features/teacher/exam/pages/TeacherExamManagement"),
  "TeacherExamManagement",
);
const CreateExamPage = lazyNamed(
  () => import("@/features/teacher/exam/pages/CreateExamPage"),
  "CreateExamPage",
);
const TeacherExamResults = lazyNamed(
  () => import("@/features/teacher/exam/pages/TeacherExamResults"),
  "TeacherExamResults",
);
const TeacherStudentExamResult = lazyNamed(
  () => import("@/features/teacher/exam/pages/TeacherStudentExamResult"),
  "TeacherStudentExamResult",
);
const TeacherGradesPage = lazyNamed(
  () => import("@/features/teacher/grade/pages/TeacherGradesPage"),
  "TeacherGradesPage",
);
const TeacherReschedulePage = lazyNamed(
  () => import("@/features/teacher/reschedule/pages/TeacherReschedulePage"),
  "TeacherReschedulePage",
);
const TeacherLeaveApprovalPage = lazyNamed(
  () => import("@/features/teacher/leave/pages/TeacherLeaveApprovalPage"),
  "TeacherLeaveApprovalPage",
);
const TeacherNotificationsPage = lazyNamed(
  () => import("@/features/teacher/notifications/pages/TeacherNotificationsPage"),
  "TeacherNotificationsPage",
);
const TeacherProfilePage = lazyNamed(
  () => import("@/features/teacher/profile/pages/TeacherProfilePage"),
  "TeacherProfilePage",
);

// ── Route definitions ────────────────────────────────────────────
export function teacherRoutes() {
  return (
    <Route
      path="/teacher"
      element={
        <RoleRoute allowRoles={["teacher"]}>
          <TeacherLayout />
        </RoleRoute>
      }
    >
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="attendance" element={<TeacherAttendancePage />} />
      <Route path="schedule" element={<TeacherSchedulePage />} />
      <Route path="classes" element={<TeacherClassesPage />} />
      <Route path="documents" element={<TeacherDocumentsPage />} />
      <Route path="exams" element={<TeacherExamManagement />} />
      <Route path="exams/create" element={<CreateExamPage />} />
      <Route path="exams/edit/:id" element={<CreateExamPage />} />
      <Route path="exams/results/:examId" element={<TeacherExamResults />} />
      <Route
        path="exams/results/:examId/student/:studentId"
        element={<TeacherStudentExamResult />}
      />
      <Route path="grades" element={<TeacherGradesPage />} />
      <Route path="reschedule" element={<TeacherReschedulePage />} />
      <Route path="leave-approval" element={<TeacherLeaveApprovalPage />} />
      <Route path="notifications" element={<TeacherNotificationsPage />} />
      <Route path="profile" element={<TeacherProfilePage />} />
    </Route>
  );
}
