package meilearning.com.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import meilearning.com.backend.dto.request.CreateFacilityRequest;
import meilearning.com.backend.dto.request.UpdateFacilityRequest;
import meilearning.com.backend.dto.response.FacilityResponse;
import meilearning.com.backend.dto.response.FacilityStatsResponse;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.entity.Facility;
import meilearning.com.backend.entity.enums.FacilityStatus;
import meilearning.com.backend.entity.enums.RoomStatus;
import meilearning.com.backend.exception.DuplicateResourceException;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.mapper.FacilityMapper;
import meilearning.com.backend.repository.FacilityRepository;
import meilearning.com.backend.repository.RoomRepository;
import meilearning.com.backend.service.FacilityService;

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
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Facility> spec = Specification.where((Specification<Facility>) null);

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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với id: " + id));
        return facilityMapper.toResponse(facility);
    }

    @Override
    public FacilityResponse create(CreateFacilityRequest request) {
        if (facilityRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tên cơ sở '" + request.getName() + "' đã tồn tại");
        }
        Facility facility = facilityMapper.toEntity(request);
        facility = facilityRepository.save(facility);
        return facilityMapper.toResponse(facility);
    }

    @Override
    public FacilityResponse update(Long id, UpdateFacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với id: " + id));

        if (request.getName() != null && !request.getName().equals(facility.getName())) {
            if (facilityRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("Tên cơ sở '" + request.getName() + "' đã tồn tại");
            }
        }

        facilityMapper.updateEntity(request, facility);
        facility = facilityRepository.save(facility);
        return facilityMapper.toResponse(facility);
    }

    @Override
    public void delete(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với id: " + id));
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
