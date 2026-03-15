package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.service.AttendanceService;
import com.meilearning.backend.service.ClassService;
import com.meilearning.backend.service.ReportsService;
import com.meilearning.backend.service.StudentService;
import com.meilearning.backend.service.TeacherService;
import com.meilearning.backend.service.TuitionService;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final ClassService classService;
    private final TuitionService tuitionService;
    private final AttendanceService attendanceService;

    @Override
    public ReportsOverviewResponse getOverview() {
        return ReportsOverviewResponse.builder()
                .students(studentService.getStats())
                .teachers(teacherService.getStats())
                .classes(classService.getStats())
                .tuition(tuitionService.getStats(null))
                .build();
    }

    @Override
    public AttendanceStatsResponse getAttendanceReport(Long classId, String month) {
        return attendanceService.getStats(classId, month);
    }

    @Override
    public TuitionStatsResponse getTuitionReport(String month) {
        return tuitionService.getStats(month);
    }
}
