package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateClassRequest;
import com.meilearning.backend.dto.request.UpdateClassRequest;
import com.meilearning.backend.dto.response.ClassResponse;
import com.meilearning.backend.dto.response.ClassStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import java.util.List;
import java.util.Map;

public interface ClassService {
    PageResponse<ClassResponse> getAll(String search, String subject, String facility,
                                        String status, Long teacherId, int page, int limit);
    ClassResponse getById(Long id);
    ClassResponse create(CreateClassRequest request);
    ClassResponse update(Long id, UpdateClassRequest request);
    void delete(Long id);
    void endClass(Long id);
    ClassStatsResponse getStats();
    List<Map<String, Object>> getEnrolledStudents(Long classId);
}
