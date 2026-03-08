import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppErrorBoundary } from "@/components/shared/error-boundary";
import { PublicOnlyRoute, RoleRoute } from "./features/shared/auth/guards";

// Landing pages
import { LandingPage } from "./features/landing/LandingPage";
import { AboutPage } from "./features/landing/AboutPage";
import { TeachersPage } from "./features/landing/TeachersPage";
import { ContactPage } from "./features/landing/ContactPage";

// Auth
import { LoginPage } from "./features/auth/LoginPage";

// User portal
import { UserLayout } from "./features/user/UserLayout";
import { UserDashboard } from "./features/user/dashboard/pages/UserDashboard";
import { CheckInPage } from "./features/user/attendance/pages/CheckInPage";
import { SchedulePage } from "./features/user/schedule/pages/SchedulePage";
import { AttendancePage } from "./features/user/attendance/pages/AttendancePage";
import { DocumentsPage } from "./features/user/documents/pages/DocumentsPage";
import { ExamList } from "./features/user/exam/pages/ExamList";
import { ExamTaking } from "./features/user/exam/pages/ExamTaking";
import { ExamResult } from "./features/user/exam/pages/ExamResult";
import { TuitionPage } from "./features/user/tuition/pages/TuitionPage";
import { LeavePage } from "./features/user/leave/pages/LeavePage";
import { UserGradesPage } from "./features/user/grade/pages/UserGradesPage";
import { ProfilePage } from "./features/user/profile/pages/ProfilePage";
import { GamesPage } from "./features/user/games/pages/GamesPage";
import { NotificationsPage } from "./features/user/notifications/pages/NotificationsPage";

// Teacher portal
import { TeacherLayout } from "./features/teacher/TeacherLayout";
import { TeacherDashboard } from "./features/teacher/dashboard/pages/TeacherDashboard";
import { TeacherAttendancePage } from "./features/teacher/attendance/pages/TeacherAttendancePage";
import { TeacherSchedulePage } from "./features/teacher/schedule/pages/TeacherSchedulePage";
import { TeacherClassesPage } from "./features/teacher/classes/pages/TeacherClassesPage";
import { TeacherGradesPage } from "./features/teacher/grade/pages/TeacherGradesPage";
import { TeacherReschedulePage } from "./features/teacher/reschedule/pages/TeacherReschedulePage";
import { TeacherProfilePage } from "./features/teacher/profile/pages/TeacherProfilePage";
import { TeacherDocumentsPage } from "./features/teacher/documents/pages/TeacherDocumentsPage";
import { TeacherExamManagement } from "./features/teacher/exam/pages/TeacherExamManagement";
import { CreateExamPage } from "./features/teacher/exam/pages/CreateExamPage";
import { TeacherExamResults } from "./features/teacher/exam/pages/TeacherExamResults";
import { TeacherStudentExamResult } from "./features/teacher/exam/pages/TeacherStudentExamResult";
import { TeacherLeaveApprovalPage } from "./features/teacher/leave/pages/TeacherLeaveApprovalPage";
import { TeacherNotificationsPage } from "./features/teacher/notifications/pages/TeacherNotificationsPage";

// Admin portal
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminDashboard } from "./features/admin/dashboard/pages/AdminDashboard";
import { QRSettingsPage } from "./features/admin/qr-settings/pages/QRSettingsPage";
import { AdminFacilitiesPage } from "./features/admin/facilities/pages/AdminFacilitiesPage";
import { AdminTeachersPage } from "./features/admin/teachers/pages/AdminTeachersPage";
import { AdminStudentsPage } from "./features/admin/students/pages/AdminStudentsPage";
import { AdminSubjectsPage } from "./features/admin/subjects/pages/AdminSubjectsPage";
import { AdminClassesPage } from "./features/admin/classes/pages/AdminClassesPage";
import { AdminSchedulePage } from "./features/admin/schedule/pages/AdminSchedulePage";
import { AdminAttendancePage } from "./features/admin/attendance/pages/AdminAttendancePage";
import { AdminTuitionPage } from "./features/admin/tuition/pages/AdminTuitionPage";
import { AdminRescheduleApprovalPage } from "./features/admin/reschedule/pages/AdminRescheduleApprovalPage";


import { AdminReportsPage } from "./features/admin/reports/pages/AdminReportsPage";
import { AdminNotificationsPage } from "./features/admin/notifications/pages/AdminNotificationsPage";
import { AdminProfilePage } from "./features/admin/profile/pages/AdminProfilePage";



import NotFound from "./pages/NotFound";
import ForbiddenPage from "./pages/Forbidden";

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            {/* User portal */}
            <Route
              path="/user"
              element={
                <RoleRoute allowRoles={["student"]}>
                  <UserLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="check-in" element={<CheckInPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="exams" element={<ExamList />} />
              <Route path="exam-taking" element={<ExamTaking />} />
              <Route path="exam-result" element={<ExamResult />} />
              <Route path="tuition" element={<TuitionPage />} />
              <Route path="leave" element={<LeavePage />} />
              <Route path="grades" element={<UserGradesPage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            
            </Route>

            {/* Teacher portal */}
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
              <Route path="exams/results/:examId/student/:studentId" element={<TeacherStudentExamResult />} />
              <Route path="grades" element={<TeacherGradesPage />} />
              <Route path="reschedule" element={<TeacherReschedulePage />} />
              <Route path="leave-approval" element={<TeacherLeaveApprovalPage />} />
              <Route path="notifications" element={<TeacherNotificationsPage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>

            {/* Admin portal */}
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
            <Route path="/403" element={<ForbiddenPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
