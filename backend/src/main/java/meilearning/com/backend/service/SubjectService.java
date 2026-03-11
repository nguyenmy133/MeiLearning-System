package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateSubjectRequest;
import meilearning.com.backend.dto.request.UpdateSubjectRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.SubjectResponse;
import meilearning.com.backend.dto.response.SubjectStatsResponse;

public interface SubjectService {

    PageResponse<SubjectResponse> getAll(String search, String category, String status,
                                         int page, int limit);

    SubjectResponse getById(Long id);

    SubjectResponse create(CreateSubjectRequest request);

    SubjectResponse update(Long id, UpdateSubjectRequest request);

    void delete(Long id);

    SubjectStatsResponse getStats();
}
