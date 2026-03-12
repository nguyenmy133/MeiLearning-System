package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateFacilityRequest;
import com.meilearning.backend.dto.request.UpdateFacilityRequest;
import com.meilearning.backend.dto.response.FacilityResponse;
import com.meilearning.backend.dto.response.FacilityStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;

public interface FacilityService {
    PageResponse<FacilityResponse> getAll(String search, String status, int page, int limit);
    FacilityResponse getById(Long id);
    FacilityResponse create(CreateFacilityRequest request);
    FacilityResponse update(Long id, UpdateFacilityRequest request);
    void delete(Long id);
    FacilityStatsResponse getStats();
}
