package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO cho cập nhật trạng thái điểm danh (Admin).
 * Thay thế raw Map<String, String>.
 */
public record UpdateAttendanceStatusRequest(
    @NotBlank(message = "Trạng thái không được để trống") String status,
    String note
) {}
