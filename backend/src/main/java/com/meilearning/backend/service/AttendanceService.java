package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import java.util.List;

public interface AttendanceService {

    /** Lấy danh sách điểm danh theo session */

    List<AttendanceResponse> getBySession(Long sessionId);

    /** Điểm danh hàng loạt (teacher) */

    List<AttendanceResponse> bulkAttendance(BulkAttendanceRequest request);

    /** QR check-in (student) */

    AttendanceResponse qrCheckIn(Long sessionId, Long studentId);

    /** Thống kª điểm danh theo class/month */

    AttendanceStatsResponse getStats(Long classId, String month);

}
