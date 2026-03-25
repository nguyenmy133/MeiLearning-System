package com.meilearning.backend.dto.request;

/**
 * DTO cho cập nhật nhận xét học viên (Teacher/Admin).
 * Thay thế raw Map<String, String>.
 */
public record UpdateGradeCommentRequest(
    String comment
) {}
