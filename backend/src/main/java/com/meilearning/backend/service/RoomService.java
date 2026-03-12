package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateRoomRequest;
import com.meilearning.backend.dto.request.UpdateRoomRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.RoomResponse;

public interface RoomService {
    PageResponse<RoomResponse> getAll(String search, Long facilityId, String status, int page, int limit);
    RoomResponse getById(Long id);
    RoomResponse create(CreateRoomRequest request);
    RoomResponse update(Long id, UpdateRoomRequest request);
    void delete(Long id);
}
