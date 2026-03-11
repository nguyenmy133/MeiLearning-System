package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateFacilityRequest;
import meilearning.com.backend.dto.request.UpdateFacilityRequest;
import meilearning.com.backend.dto.response.FacilityResponse;
import meilearning.com.backend.dto.response.FacilityStatsResponse;
import meilearning.com.backend.dto.response.PageResponse;

public interface FacilityService {
    PageResponse<FacilityResponse> getAll(String search, String status, int page, int limit);
    FacilityResponse getById(Long id);
    FacilityResponse create(CreateFacilityRequest request);
    FacilityResponse update(Long id, UpdateFacilityRequest request);
    void delete(Long id);
    FacilityStatsResponse getStats();
}
