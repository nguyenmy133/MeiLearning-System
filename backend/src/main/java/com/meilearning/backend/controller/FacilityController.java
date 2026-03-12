package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateFacilityRequest;
import com.meilearning.backend.dto.request.UpdateFacilityRequest;
import com.meilearning.backend.dto.response.FacilityResponse;
import com.meilearning.backend.dto.response.FacilityStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.service.FacilityService;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
@Tag(name = "Facility", description = "Quáº£n lĂ½ cÆ¡ sá»Ÿ (chi nhĂ¡nh)")
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch cÆ¡ sá»Ÿ")
    public ResponseEntity<PageResponse<FacilityResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(facilityService.getAll(search, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t cÆ¡ sá»Ÿ")
    public ResponseEntity<FacilityResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o cÆ¡ sá»Ÿ má»›i")
    public ResponseEntity<FacilityResponse> create(@Valid @RequestBody CreateFacilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t cÆ¡ sá»Ÿ")
    public ResponseEntity<FacilityResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateFacilityRequest request) {
        return ResponseEntity.ok(facilityService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a cÆ¡ sá»Ÿ")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facilityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Láº¥y thá»‘ng kĂª cÆ¡ sá»Ÿ váº­t cháº¥t")
    public ResponseEntity<FacilityStatsResponse> getStats() {
        return ResponseEntity.ok(facilityService.getStats());
    }
}
