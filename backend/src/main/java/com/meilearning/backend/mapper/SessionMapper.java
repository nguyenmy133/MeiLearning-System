package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.Room;
import com.meilearning.backend.entity.enums.AttendanceStatus;
@Component
public class SessionMapper {

    public ClassSessionResponse toResponse(ClassSession session) {
        int presentCount = 0;
        int absentCount = 0;

        if (session.getAttendanceRecords() != null) {
            for (var record : session.getAttendanceRecords()) {
                if (record.getStatus() == AttendanceStatus.present
                        || record.getStatus() == AttendanceStatus.late) {
                    presentCount++;
                } else {
                    absentCount++;
                }
            }
        }

        // Use roomOverride if set, otherwise fall back to class's default room
        Room effectiveRoom = session.getRoomOverride() != null
                ? session.getRoomOverride()
                : session.getClassEntity().getRoom();

        return ClassSessionResponse.builder()
                .id(session.getId())
                .classId(session.getClassEntity().getId())
                .className(session.getClassEntity().getName())
                .subjectName(session.getClassEntity().getSubject().getName())
                .teacherName(session.getClassEntity().getTeacher().getUser().getName())
                .roomName(effectiveRoom != null ? effectiveRoom.getName() : null)
                .roomId(effectiveRoom != null ? effectiveRoom.getId() : null)
                .facilityName(effectiveRoom != null && effectiveRoom.getFacility() != null
                        ? effectiveRoom.getFacility().getName() : null)
                .facilityId(effectiveRoom != null && effectiveRoom.getFacility() != null
                        ? effectiveRoom.getFacility().getId() : null)
                .date(session.getDate().toString())
                .startTime(session.getStartTime().toString())
                .endTime(session.getEndTime().toString())
                .status(session.getStatus().name())
                .type(session.getType().name())
                .classStatus(session.getClassEntity().getStatus().name())
                .notes(session.getNotes())
                .totalStudents(session.getClassEntity().getEnrollments() != null
                        ? session.getClassEntity().getEnrollments().size() : 0)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .createdAt(session.getCreatedAt())
                .build();
    }

    public AttendanceResponse toAttendanceResponse(AttendanceRecord record) {
        return AttendanceResponse.builder()
                .id(record.getId())
                .sessionId(record.getSession().getId())
                .studentId(record.getStudent().getId())
                .studentName(record.getStudent().getUser().getName())
                .status(record.getStatus().name())
                .checkInTime(record.getCheckInTime() != null ? record.getCheckInTime().toString() : null)
                .method(record.getMethod() != null ? record.getMethod().name() : null)
                .note(record.getNote())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
