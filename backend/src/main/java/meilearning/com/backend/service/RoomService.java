package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateRoomRequest;
import meilearning.com.backend.dto.request.UpdateRoomRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.RoomResponse;

public interface RoomService {
    PageResponse<RoomResponse> getAll(String search, Long facilityId, String status, int page, int limit);
    RoomResponse getById(Long id);
    RoomResponse create(CreateRoomRequest request);
    RoomResponse update(Long id, UpdateRoomRequest request);
    void delete(Long id);
}
