package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho Admin gửi thông báo chủ động.
 * Có thể gửi cho 1 user cụ thể hoặc broadcast cho tất cả.
 */
@Getter
@Setter
public class SendNotificationRequest {

    /** ID người nhận (null = broadcast tất cả) */
    private Long userId;

    /** Role filter khi broadcast: "admin", "teacher", "student" (null = tất cả) */
    private String role;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    /** Severity: LOW, MEDIUM, HIGH (default: LOW = In-App only) */
    private String severity;
}
