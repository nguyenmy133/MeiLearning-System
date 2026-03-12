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

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "Quáº£n lĂ½ phĂ²ng há»c")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch phĂ²ng há»c")
    public ResponseEntity<PageResponse<RoomResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long facilityId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(roomService.getAll(search, facilityId, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t phĂ²ng há»c")
    public ResponseEntity<RoomResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o phĂ²ng há»c má»›i")
    public ResponseEntity<RoomResponse> create(@Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t phĂ²ng há»c")
    public ResponseEntity<RoomResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateRoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a phĂ²ng há»c")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
