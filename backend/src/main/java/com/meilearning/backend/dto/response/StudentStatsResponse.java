package com.meilearning.backend.dto.response;

import lombok.*;
@Getter @Builder @AllArgsConstructor
public class StudentStatsResponse {
    private long totalStudents;
    private long activeStudents;
    private long unpaidTuitionCount;     // pending + overdue (chưa đóng phí)
    private long newStudentsThisMonth;   // tạo mới trong tháng hiện tại
}
