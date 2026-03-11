package meilearning.com.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import meilearning.com.backend.dto.request.CreateRoomRequest;
import meilearning.com.backend.dto.request.UpdateRoomRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.RoomResponse;
import meilearning.com.backend.entity.Facility;
import meilearning.com.backend.entity.Room;
import meilearning.com.backend.entity.enums.RoomStatus;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.mapper.RoomMapper;
import meilearning.com.backend.repository.FacilityRepository;
import meilearning.com.backend.repository.RoomRepository;
import meilearning.com.backend.service.RoomService;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final FacilityRepository facilityRepository;
    private final RoomMapper roomMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getAll(String search, Long facilityId, String status,
                                              int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Room> spec = Specification.where((Specification<Room>) null);

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), keyword));
        }

        if (facilityId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("facility").get("id"), facilityId));
        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            RoomStatus roomStatus = RoomStatus.valueOf(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), roomStatus));
        }

        Page<Room> result = roomRepository.findAll(spec, pageable);

        return PageResponse.<RoomResponse>builder()
                .data(result.getContent().stream().map(roomMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + id));
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse create(CreateRoomRequest request) {
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với id: " + request.getFacilityId()));

        Room room = roomMapper.toEntity(request, facility);
        room = roomRepository.save(room);
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse update(Long id, UpdateRoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + id));

        Facility facility = null;
        if (request.getFacilityId() != null && !request.getFacilityId().equals(room.getFacility().getId())) {
            facility = facilityRepository.findById(request.getFacilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với id: " + request.getFacilityId()));
        }

        roomMapper.updateEntity(request, room, facility);
        room = roomRepository.save(room);
        return roomMapper.toResponse(room);
    }

    @Override
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với id: " + id));
        roomRepository.delete(room);
    }
}
