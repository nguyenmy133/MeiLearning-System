package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;

import java.util.List;

public interface AttendanceService {

    /** Láº¥y danh sĂ¡ch Ä‘iá»ƒm danh theo session */
    List<AttendanceResponse> getBySession(Long sessionId);

    /** Äiá»ƒm danh hĂ ng loáº¡t (teacher) */
    List<AttendanceResponse> bulkAttendance(BulkAttendanceRequest request);

    /** QR check-in (student) */
    AttendanceResponse qrCheckIn(Long sessionId, Long studentId);

    /** Thá»‘ng kĂª Ä‘iá»ƒm danh theo class/month */
    AttendanceStatsResponse getStats(Long classId, String month);
}
