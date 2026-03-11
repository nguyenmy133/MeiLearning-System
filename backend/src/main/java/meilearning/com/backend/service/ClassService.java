package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateClassRequest;
import meilearning.com.backend.dto.request.UpdateClassRequest;
import meilearning.com.backend.dto.response.ClassResponse;
import meilearning.com.backend.dto.response.ClassStatsResponse;
import meilearning.com.backend.dto.response.PageResponse;

public interface ClassService {
    PageResponse<ClassResponse> getAll(String search, String subject, String facility,
                                        String status, Long teacherId, int page, int limit);
    ClassResponse getById(Long id);
    ClassResponse create(CreateClassRequest request);
    ClassResponse update(Long id, UpdateClassRequest request);
    void delete(Long id);
    void endClass(Long id);
    ClassStatsResponse getStats();
}
