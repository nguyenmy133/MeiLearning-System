package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateTeacherRequest;
import com.meilearning.backend.dto.request.UpdateTeacherRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.TeacherResponse;
import com.meilearning.backend.dto.response.TeacherStatsResponse;

public interface TeacherService {
    PageResponse<TeacherResponse> getAll(String search, String subject, String status, int page, int limit);
    TeacherResponse getById(Long id);
    TeacherResponse create(CreateTeacherRequest request);
    TeacherResponse update(Long id, UpdateTeacherRequest request);
    void delete(Long id);
    String resetPassword(Long id);
    void lockAccount(Long id);
    void unlockAccount(Long id);
    TeacherStatsResponse getStats();
}
