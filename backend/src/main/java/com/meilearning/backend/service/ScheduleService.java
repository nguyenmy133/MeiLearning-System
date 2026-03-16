package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;
import java.util.List;

public interface ScheduleService {

    /** Generate ClassSessions cho 1 Class từ schedule JSON (recurring) */

    void generateSessions(Long classId);

    /** Generate sessions cho tất cả classes active */

    void generateAllSessions();

    /** Lấy lịch theo ngày/tuáº§n/tháng */

    ScheduleResponse getSchedule(String date, String view);

    /** Lấy lịch theo teacher */

    ScheduleResponse getTeacherSchedule(Long teacherId, String date, String view);

    /** Lấy lịch theo student */

    ScheduleResponse getStudentSchedule(Long studentId, String date, String view);

    /** Lấy sessions của 1 class */

    List<ClassSessionResponse> getClassSessions(Long classId);

    /** Lấy chi tiết 1 session */

    ClassSessionResponse getSessionById(Long id);

}
