package meilearning.com.backend.mapper;

import org.springframework.stereotype.Component;
import meilearning.com.backend.dto.request.CreateFacilityRequest;
import meilearning.com.backend.dto.request.UpdateFacilityRequest;
import meilearning.com.backend.dto.response.FacilityResponse;
import meilearning.com.backend.entity.Facility;

@Component
public class FacilityMapper {

    public Facility toEntity(CreateFacilityRequest request) {
        return Facility.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .manager(request.getManager())
                .build();
    }

    public FacilityResponse toResponse(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .name(facility.getName())
                .address(facility.getAddress())
                .phone(facility.getPhone())
                .manager(facility.getManager())
                .status(facility.getStatus().name())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }

    public void updateEntity(UpdateFacilityRequest request, Facility facility) {
        if (request.getName() != null) facility.setName(request.getName());
        if (request.getAddress() != null) facility.setAddress(request.getAddress());
        if (request.getPhone() != null) facility.setPhone(request.getPhone());
        if (request.getManager() != null) facility.setManager(request.getManager());
        if (request.getStatus() != null) facility.setStatus(request.getStatus());
    }
}
