package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meilearning.backend.dto.request.CreateFacilityRequest;
import com.meilearning.backend.dto.request.UpdateFacilityRequest;
import com.meilearning.backend.dto.response.FacilityResponse;
import com.meilearning.backend.dto.response.FacilityStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import com.meilearning.backend.entity.Facility;
import com.meilearning.backend.entity.enums.FacilityStatus;
import com.meilearning.backend.entity.enums.RoomStatus;
import com.meilearning.backend.exception.DuplicateResourceException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.FacilityMapper;
import com.meilearning.backend.repository.FacilityRepository;
import com.meilearning.backend.repository.RoomRepository;
import com.meilearning.backend.service.FacilityService;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final RoomRepository roomRepository;
    private final FacilityMapper facilityMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FacilityResponse> getAll(String search, String status, int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Facility> spec = SpecHelper.empty();

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), keyword),
                            cb.like(cb.lower(root.get("address")), keyword)
                    ));
        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            FacilityStatus facilityStatus = FacilityStatus.valueOf(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), facilityStatus));
        }

        Page<Facility> result = facilityRepository.findAll(spec, pageable);

        return PageResponse.<FacilityResponse>builder()
                .data(result.getContent().stream().map(facilityMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponse getById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y cÆ¡ sá»Ÿ vá»›i id: " + id));
        return facilityMapper.toResponse(facility);
    }

    @Override
    public FacilityResponse create(CreateFacilityRequest request) {
        if (facilityRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("TĂªn cÆ¡ sá»Ÿ '" + request.getName() + "' Ä‘Ă£ tá»“n táº¡i");
        }
        Facility facility = facilityMapper.toEntity(request);
        facility = facilityRepository.save(facility);
        return facilityMapper.toResponse(facility);
    }

    @Override
    public FacilityResponse update(Long id, UpdateFacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y cÆ¡ sá»Ÿ vá»›i id: " + id));

        if (request.getName() != null && !request.getName().equals(facility.getName())) {
            if (facilityRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("TĂªn cÆ¡ sá»Ÿ '" + request.getName() + "' Ä‘Ă£ tá»“n táº¡i");
            }
        }

        facilityMapper.updateEntity(request, facility);
        facility = facilityRepository.save(facility);
        return facilityMapper.toResponse(facility);
    }

    @Override
    public void delete(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y cÆ¡ sá»Ÿ vá»›i id: " + id));
        facilityRepository.delete(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityStatsResponse getStats() {
        return FacilityStatsResponse.builder()
                .totalFacilities(facilityRepository.count())
                .totalRooms(roomRepository.count())
                .totalCapacity(roomRepository.sumTotalCapacity())
                .availableRooms(roomRepository.countByStatus(RoomStatus.available))
                .activeFacilities(facilityRepository.countByStatus(FacilityStatus.active))
                .build();
    }
}
