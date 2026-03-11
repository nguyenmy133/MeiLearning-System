package meilearning.com.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

/**
 * Bulk attendance: Teacher gửi điểm danh cho cả lớp 1 buổi.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BulkAttendanceRequest {
    @NotNull
    private Long sessionId;
    private List<AttendanceEntry> attendances;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AttendanceEntry {
        @NotNull
        private Long studentId;
        @NotNull
        private String status;   // PRESENT, ABSENT, LATE, ABSENT_EXCUSED
        private String note;
    }
}
