package com.meilearning.backend.dto.response;

import lombok.*;
@Getter @Builder @AllArgsConstructor
public class TuitionStatsResponse {
    private long totalInvoices;
    private long pendingCount;
    private long reviewingCount;
    private long paidCount;
    private long overdueCount;
    private long totalRevenue;
    private long monthRevenue;
}
