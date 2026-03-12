package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateSubjectRequest;
import com.meilearning.backend.dto.request.UpdateSubjectRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.SubjectResponse;
import com.meilearning.backend.dto.response.SubjectStatsResponse;

public interface SubjectService {

    PageResponse<SubjectResponse> getAll(String search, String category, String status,
                                         int page, int limit);

    SubjectResponse getById(Long id);

    SubjectResponse create(CreateSubjectRequest request);

    SubjectResponse update(Long id, UpdateSubjectRequest request);

    void delete(Long id);

    SubjectStatsResponse getStats();
}
