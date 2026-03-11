package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateTeacherRequest;
import meilearning.com.backend.dto.request.UpdateTeacherRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.TeacherResponse;
import meilearning.com.backend.dto.response.TeacherStatsResponse;

public interface TeacherService {
    PageResponse<TeacherResponse> getAll(String search, String subject, String status, int page, int limit);
    TeacherResponse getById(Long id);
    TeacherResponse create(CreateTeacherRequest request);
    TeacherResponse update(Long id, UpdateTeacherRequest request);
    void delete(Long id);
    void resetPassword(Long id);
    void lockAccount(Long id);
    void unlockAccount(Long id);
    TeacherStatsResponse getStats();
}
