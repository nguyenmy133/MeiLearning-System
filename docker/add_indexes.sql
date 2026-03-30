-- ============================================================
-- Phase 2: FK Indexes — MeiLearning System
-- ============================================================

-- ── students ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_user_id
    ON students(user_id);

-- ── teachers ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_teachers_user_id
    ON teachers(user_id);

-- ── class_enrollments ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id
    ON class_enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_class_id
    ON class_enrollments(class_id);

-- ── attendance_records (QUAN TRỌNG NHẤT!) ────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_session_id
    ON attendance_records(session_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id
    ON attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_status
    ON attendance_records(student_id, status);

-- ── tuition_invoices ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tuition_class_id
    ON tuition_invoices(class_id);

-- ── exam_results ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exam_results_student
    ON exam_results(student_id);

CREATE INDEX IF NOT EXISTS idx_exam_results_exam
    ON exam_results(exam_id);

-- ── exam_answer_details ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_answer_details_result
    ON exam_answer_details(exam_result_id);

CREATE INDEX IF NOT EXISTS idx_answer_details_question
    ON exam_answer_details(question_id);

-- ── grades ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_grades_student
    ON grades(student_id);

CREATE INDEX IF NOT EXISTS idx_grades_class
    ON grades(class_id);

-- ── leave_requests ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leave_student
    ON leave_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_leave_teacher
    ON leave_requests(teacher_id);

-- ── reschedule_requests ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reschedule_class
    ON reschedule_requests(class_id);

CREATE INDEX IF NOT EXISTS idx_reschedule_session
    ON reschedule_requests(session_id);

-- ============================================================
-- Phase 3: Partial Indexes
-- ============================================================

-- Học sinh đang active
CREATE INDEX IF NOT EXISTS idx_students_active
    ON students(status) WHERE status = 'active';

-- Hóa đơn pending
CREATE INDEX IF NOT EXISTS idx_tuition_pending
    ON tuition_invoices(student_id, due_date) WHERE status = 'pending';

-- Thông báo chưa đọc
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id, created_at DESC) WHERE is_read = false;

-- Lớp đang hoạt động
CREATE INDEX IF NOT EXISTS idx_classes_active
    ON classes(teacher_id, status) WHERE status IN ('active', 'upcoming');

-- QR Token chưa dùng
CREATE INDEX IF NOT EXISTS idx_qr_token_active
    ON attendance_qr_tokens(token) WHERE used = false;

-- Covering index cho báo cáo điểm danh
CREATE INDEX IF NOT EXISTS idx_attendance_covering
    ON attendance_records(session_id, student_id)
    INCLUDE (status, check_in_time);

-- ============================================================
-- Kiểm tra kết quả
-- ============================================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
