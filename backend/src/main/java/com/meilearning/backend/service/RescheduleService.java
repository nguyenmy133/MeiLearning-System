package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateRescheduleRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.RescheduleRequestResponse;
import java.util.List;

public interface RescheduleService {
    RescheduleRequestResponse create(CreateRescheduleRequest request);
    PageResponse<RescheduleRequestResponse> getAll(String status, int page, int limit);
    List<RescheduleRequestResponse> getAll(String status);
    List<RescheduleRequestResponse> getByTeacher(Long teacherId);
    RescheduleRequestResponse approve(Long id, String reviewedBy);
    RescheduleRequestResponse reject(Long id, String reviewedBy, String reason);

    /** Lấy yêu cầu của teacher đang đăng nhập (resolve từ JWT username) */
    List<RescheduleRequestResponse> getByTeacherUsername(String username);

    /** Tạo yêu cầu từ teacher đang đăng nhập (resolve teacherId từ JWT) */
    RescheduleRequestResponse createByUsername(String username, CreateRescheduleRequest request);
}
