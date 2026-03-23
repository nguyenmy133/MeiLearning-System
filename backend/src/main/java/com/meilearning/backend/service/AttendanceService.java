package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.QrTokenResponse;
import java.util.List;

public interface AttendanceService {

    /** Lấy danh sách điểm danh theo session */
    List<AttendanceResponse> getBySession(Long sessionId);

    /** Điểm danh hàng loạt (teacher) */
    List<AttendanceResponse> bulkAttendance(BulkAttendanceRequest request);

    /** QR check-in (student) — legacy, dùng sessionId trực tiếp */
    AttendanceResponse qrCheckIn(Long sessionId, Long studentId);

    /** Tạo QR token cho session (teacher) */
    QrTokenResponse generateQrToken(Long sessionId);

    /** Điểm danh bằng QR token (student) */
    AttendanceResponse qrTokenCheckIn(String token, Long studentId);

    /** Thống kê điểm danh theo class/month */
    AttendanceStatsResponse getStats(Long classId, String month);

    /** Lấy danh sách buổi dạy của teacher đang đăng nhập (resolve từ JWT username) */
    List<ClassSessionResponse> getSessionsByTeacherUsername(String username, String date);

    /** Lấy danh sách đầy đủ học viên + trạng thái điểm danh cho 1 buổi học */
    List<AttendanceResponse> getSessionRoster(Long sessionId);

    /** [Admin] Lấy tất cả sessions với bộ lọc (classId, date) */
    List<ClassSessionResponse> getAllSessions(Long classId, String date);

    /** [Admin] Cập nhật trạng thái điểm danh 1 bản ghi */
    AttendanceResponse updateRecord(Long recordId, String status, String note);

    /** [Student] Lấy danh sách điểm danh cá nhân (từ JWT) */
    List<AttendanceResponse> getStudentRecords(Long studentId, Long classId);

    /** [Teacher/Admin] Lấy QR token đang active cho session (để restore khi quay lại trang) */
    QrTokenResponse getActiveQrToken(Long sessionId);

}
