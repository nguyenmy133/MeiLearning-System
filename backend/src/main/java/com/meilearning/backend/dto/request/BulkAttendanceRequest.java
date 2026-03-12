package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

/**
 * Bulk attendance: Teacher gá»­i Ä‘iá»ƒm danh cho cáº£ lá»›p 1 buá»•i.
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
