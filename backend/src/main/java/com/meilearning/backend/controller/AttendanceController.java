package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.QrTokenResponse;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.util.CurrentUserResolver;
import com.meilearning.backend.service.AttendanceService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Quản lý điểm danh")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final CurrentUserResolver currentUser;

    @GetMapping
    @Operation(summary = "Lấy danh sách điểm danh theo buổi")
    public ResponseEntity<List<AttendanceResponse>> getBySession(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getBySession(sessionId));
    }

    /**
     * Lấy danh sách buổi dạy của teacher đang đăng nhập.
     * Resolve teacher từ JWT Principal, KHÔNG cần FE truyền teacherId.
     */
    @GetMapping("/sessions/teacher/me")
    @Operation(summary = "Lấy buổi dạy của giáo viên đang đăng nhập (theo ngày)")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<List<ClassSessionResponse>> getMyTeacherSessions(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(
                attendanceService.getSessionsByTeacherUsername(principal.getName(), date));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Điểm danh hàng loạt (teacher)")
    public ResponseEntity<List<AttendanceResponse>> bulkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.bulkAttendance(request));
    }

    /**
     * @deprecated Insecure — cho phép check-in không cần QR token.
     * Sử dụng POST /qr/check-in?token=... thay thế.
     */
    @Deprecated
    @PostMapping("/check-in/me")
    @Operation(summary = "[DEPRECATED] QR Check-in (student) — dùng /qr/check-in thay thế", deprecated = true)
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<String> qrCheckInMe(
            Principal principal,
            @RequestParam Long sessionId) {
        return ResponseEntity.status(410).body("Endpoint đã ngưng sử dụng. Vui lòng quét mã QR để điểm danh.");
    }

    /**
     * QR Check-in (legacy/admin) — chỉ admin mới chỉ định studentId.
     */
    @PostMapping("/check-in")
    @Operation(summary = "QR Check-in (admin, chỉ định studentId)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<AttendanceResponse> qrCheckIn(
            @RequestParam Long sessionId,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(attendanceService.qrCheckIn(sessionId, studentId));
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê điểm danh")
    public ResponseEntity<AttendanceStatsResponse> getStats(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(attendanceService.getStats(classId, month));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Lấy log điểm danh bất thường (vắng, muộn) feed realtime")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<List<com.meilearning.backend.dto.response.AttendanceActivityLogResponse>> getAlerts() {
        return ResponseEntity.ok(attendanceService.getUnusualActivityFeed());
    }

    // ── QR Token Endpoints ───────────────────────────────────────────────

    /**
     * Teacher tạo QR token cho session. Invalidate token cũ.
     */
    @PostMapping("/qr/generate")
    @Operation(summary = "Tạo mã QR token cho buổi học (teacher/admin)")
    @PreAuthorize("hasAnyRole('teacher', 'admin')")
    public ResponseEntity<QrTokenResponse> generateQrToken(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.generateQrToken(sessionId));
    }

    /**
     * Lấy QR token đang active cho session (để restore khi teacher quay lại trang).
     * Trả 200 + token nếu có, 204 No Content nếu không.
     */
    @GetMapping("/qr/active")
    @Operation(summary = "Lấy QR token active cho session (teacher/admin)")
    @PreAuthorize("hasAnyRole('teacher', 'admin')")
    public ResponseEntity<QrTokenResponse> getActiveQrToken(@RequestParam Long sessionId) {
        QrTokenResponse active = attendanceService.getActiveQrToken(sessionId);
        if (active == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(active);
    }

    /**
     * Student điểm danh bằng QR token (cả deep link và in-app scanner).
     */
    @PostMapping("/qr/check-in")
    @Operation(summary = "Điểm danh bằng QR token (student)")
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<AttendanceResponse> qrTokenCheckIn(
            @RequestParam String token) {
        Student student = currentUser.getStudent();
        return ResponseEntity.ok(attendanceService.qrTokenCheckIn(token, student.getId()));
    }

    /**
     * Danh sách đầy đủ học viên + trạng thái điểm danh cho 1 buổi (roster).
     * Enrolled students chưa có record sẽ trả về status = "pending".
     */
    @GetMapping("/roster")
    @Operation(summary = "Lấy roster (tất cả enrolled students + attendance status)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<List<AttendanceResponse>> getSessionRoster(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionRoster(sessionId));
    }

    // ── Admin: All Sessions ───────────────────────────────────────────────

    @GetMapping("/sessions/all")
    @Operation(summary = "[Admin] Lấy tất cả sessions với filter")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<ClassSessionResponse>> getAllSessions(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(attendanceService.getAllSessions(classId, date));
    }

    // ── Admin: Update single record ───────────────────────────────────────

    @PatchMapping("/records/{id}")
    @Operation(summary = "[Admin] Cập nhật trạng thái điểm danh 1 bản ghi")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<AttendanceResponse> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody com.meilearning.backend.dto.request.UpdateAttendanceStatusRequest request) {
        return ResponseEntity.ok(attendanceService.updateRecord(id, request.status(), request.note()));
    }

    // ── Student: Personal attendance ──────────────────────────────────────

    @GetMapping("/me")
    @Operation(summary = "[Student] Lấy điểm danh cá nhân")
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            @RequestParam(required = false) Long classId) {
        Student student = currentUser.getStudent();
        return ResponseEntity.ok(attendanceService.getStudentRecords(student.getId(), classId));
    }

}
