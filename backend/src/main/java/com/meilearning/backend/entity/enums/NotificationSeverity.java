package com.meilearning.backend.entity.enums;

/**
 * Mức độ quan trọng của thông báo — quyết định gửi qua kênh nào.
 *
 * LOW    → In-App only
 * MEDIUM → In-App + Email
 * HIGH   → In-App + Email + SMS
 */
public enum NotificationSeverity {
    LOW,
    MEDIUM,
    HIGH
}
