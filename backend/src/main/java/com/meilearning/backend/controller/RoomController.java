package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateRoomRequest;
import com.meilearning.backend.dto.request.UpdateRoomRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.RoomResponse;
import com.meilearning.backend.service.RoomService;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "Quản lý phòng học")
@PreAuthorize("hasRole('admin')")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Lấy danh sách phòng học")
    public ResponseEntity<PageResponse<RoomResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(roomService.getAll(search, facilityId, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết phòng học")
    public ResponseEntity<RoomResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo phòng học mới")
    public ResponseEntity<RoomResponse> create(@Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật phòng học")
    public ResponseEntity<RoomResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateRoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phòng học")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
