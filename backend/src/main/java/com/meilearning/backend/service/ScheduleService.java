package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {

    /** Generate ClassSessions cho 1 Class tá»« schedule JSON (recurring) */
    void generateSessions(Long classId);

    /** Generate sessions cho táº¥t cáº£ classes active */
    void generateAllSessions();

    /** Láº¥y lá»‹ch theo ngĂ y/tuáº§n/thĂ¡ng */
    ScheduleResponse getSchedule(String date, String view);

    /** Láº¥y lá»‹ch theo teacher */
    ScheduleResponse getTeacherSchedule(Long teacherId, String date, String view);

    /** Láº¥y lá»‹ch theo student */
    ScheduleResponse getStudentSchedule(Long studentId, String date, String view);

    /** Láº¥y sessions cá»§a 1 class */
    List<ClassSessionResponse> getClassSessions(Long classId);

    /** Láº¥y chi tiáº¿t 1 session */
    ClassSessionResponse getSessionById(Long id);
}
