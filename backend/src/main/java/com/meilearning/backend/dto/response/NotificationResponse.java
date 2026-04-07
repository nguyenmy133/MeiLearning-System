package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Notification DTO — khớp FE NotificationItem type.
 */
@Getter
@Builder
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String content;
    private String time;
    private String date;
    private boolean read;
    /** ISO-8601 string — FE dùng để hiển thị relative time ("2 phút trước") */
    private String createdAt;
}
