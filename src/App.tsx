import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";

// Landing pages
import { LandingPage } from "./features/landing/LandingPage";
import { AboutPage } from "./features/landing/AboutPage";
import { TeachersPage } from "./features/landing/TeachersPage";
import { ContactPage } from "./features/landing/ContactPage";

// Auth
import { LoginPage } from "./features/auth/LoginPage";

// User portal
import { UserLayout } from "./features/user/UserLayout";
import { UserDashboard } from "./features/user/pages/UserDashboard";
import { CheckInPage } from "./features/user/pages/CheckInPage";
import { SchedulePage } from "./features/user/pages/SchedulePage";
import { AttendancePage } from "./features/user/pages/AttendancePage";
import { DocumentsPage } from "./features/user/pages/DocumentsPage";
import { VideoLibrary } from "./features/user/pages/VideoLibrary";
import { VideoPlayer } from "./features/user/pages/VideoPlayer";
import { ExamList } from "./features/user/pages/ExamList";
import { ExamTaking } from "./features/user/pages/ExamTaking";
import { ExamResult } from "./features/user/pages/ExamResult";
import { TuitionPage } from "./features/user/pages/TuitionPage";
import { LeavePage } from "./features/user/pages/LeavePage";
import { TicketsPage } from "./features/user/pages/TicketsPage";
import { NotificationsPage } from "./features/user/pages/NotificationsPage";
import { ProfilePage } from "./features/user/pages/ProfilePage";

// Teacher portal
import { TeacherLayout } from "./features/teacher/TeacherLayout";
import { TeacherDashboard } from "./features/teacher/pages/TeacherDashboard";
import { TeacherAttendancePage } from "./features/teacher/pages/TeacherAttendancePage";
import { TeacherSchedulePage } from "./features/teacher/pages/TeacherSchedulePage";
import { TeacherClassesPage } from "./features/teacher/pages/TeacherClassesPage";
import { TeacherGradesPage } from "./features/teacher/pages/TeacherGradesPage";
import { TeacherReschedulePage } from "./features/teacher/pages/TeacherReschedulePage";
import { TeacherNotificationsPage } from "./features/teacher/pages/TeacherNotificationsPage";
import { TeacherProfilePage } from "./features/teacher/pages/TeacherProfilePage";
import { TeacherDocumentsPage } from "./features/teacher/pages/TeacherDocumentsPage";
import { TeacherExamManagement } from "./features/teacher/pages/TeacherExamManagement";
import { CreateExamPage } from "./features/teacher/pages/CreateExamPage";
import { TeacherExamResults } from "./features/teacher/pages/TeacherExamResults";

// Admin portal
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminDashboard } from "./features/admin/pages/AdminDashboard";
import { QRSettingsPage } from "./features/admin/pages/QRSettingsPage";
import { AdminFacilitiesPage } from "./features/admin/pages/AdminFacilitiesPage";
import { AdminTeachersPage } from "./features/admin/pages/AdminTeachersPage";
import { AdminStudentsPage } from "./features/admin/pages/AdminStudentsPage";
import { AdminSubjectsPage } from "./features/admin/pages/AdminSubjectsPage";
import { AdminClassesPage } from "./features/admin/pages/AdminClassesPage";
import { AdminSchedulePage } from "./features/admin/pages/AdminSchedulePage";
import { AdminAttendancePage } from "./features/admin/pages/AdminAttendancePage";
import { AdminTuitionPage } from "./features/admin/pages/AdminTuitionPage";
import { AdminLeadsPage } from "./features/admin/pages/AdminLeadsPage";
import { AdminTicketsPage } from "./features/admin/pages/AdminTicketsPage";
import { AdminReportsPage } from "./features/admin/pages/AdminReportsPage";

import { AdminAuditPage } from "./features/admin/pages/AdminAuditPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/login" element={<LoginPage />} />

          {/* User portal */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="check-in" element={<CheckInPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="videos" element={<VideoLibrary />} />
            <Route path="video-player" element={<VideoPlayer />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exam-taking" element={<ExamTaking />} />
            <Route path="exam-result" element={<ExamResult />} />
            <Route path="tuition" element={<TuitionPage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Teacher portal */}
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendancePage />} />
            <Route path="schedule" element={<TeacherSchedulePage />} />
            <Route path="classes" element={<TeacherClassesPage />} />
            <Route path="documents" element={<TeacherDocumentsPage />} />
            <Route path="exams" element={<TeacherExamManagement />} />
            <Route path="exams/create" element={<CreateExamPage />} />
            <Route path="exams/edit/:id" element={<CreateExamPage />} />
            <Route path="exams/results/:id" element={<TeacherExamResults />} />
            <Route path="grades" element={<TeacherGradesPage />} />
            <Route path="reschedule" element={<TeacherReschedulePage />} />
            <Route path="notifications" element={<TeacherNotificationsPage />} />
            <Route path="profile" element={<TeacherProfilePage />} />
          </Route>

          {/* Admin portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="qr-settings" element={<QRSettingsPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="subjects" element={<AdminSubjectsPage />} />
            <Route path="classes" element={<AdminClassesPage />} />
            <Route path="schedule" element={<AdminSchedulePage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="tuition" element={<AdminTuitionPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />

            <Route path="audit" element={<AdminAuditPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
