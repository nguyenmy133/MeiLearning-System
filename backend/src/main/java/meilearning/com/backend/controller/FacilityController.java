package meilearning.com.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import meilearning.com.backend.dto.request.CreateFacilityRequest;
import meilearning.com.backend.dto.request.UpdateFacilityRequest;
import meilearning.com.backend.dto.response.FacilityResponse;
import meilearning.com.backend.dto.response.FacilityStatsResponse;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.service.FacilityService;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
@Tag(name = "Facility", description = "Quản lý cơ sở (chi nhánh)")
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    @Operation(summary = "Lấy danh sách cơ sở")
    public ResponseEntity<PageResponse<FacilityResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(facilityService.getAll(search, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết cơ sở")
    public ResponseEntity<FacilityResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo cơ sở mới")
    public ResponseEntity<FacilityResponse> create(@Valid @RequestBody CreateFacilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật cơ sở")
    public ResponseEntity<FacilityResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateFacilityRequest request) {
        return ResponseEntity.ok(facilityService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa cơ sở")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facilityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê cơ sở vật chất")
    public ResponseEntity<FacilityStatsResponse> getStats() {
        return ResponseEntity.ok(facilityService.getStats());
    }
}
