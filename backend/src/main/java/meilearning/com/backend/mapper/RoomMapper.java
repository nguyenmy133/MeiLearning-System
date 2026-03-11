package meilearning.com.backend.mapper;

import org.springframework.stereotype.Component;
import meilearning.com.backend.dto.request.CreateRoomRequest;
import meilearning.com.backend.dto.request.UpdateRoomRequest;
import meilearning.com.backend.dto.response.RoomResponse;
import meilearning.com.backend.entity.Facility;
import meilearning.com.backend.entity.Room;

@Component
public class RoomMapper {

    public Room toEntity(CreateRoomRequest request, Facility facility) {
        return Room.builder()
                .name(request.getName())
                .facility(facility)
                .capacity(request.getCapacity())
                .build();
    }

    public RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .facilityId(room.getFacility().getId())
                .facilityName(room.getFacility().getName())
                .capacity(room.getCapacity())
                .status(room.getStatus().name())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    public void updateEntity(UpdateRoomRequest request, Room room, Facility facility) {
        if (request.getName() != null) room.setName(request.getName());
        if (facility != null) room.setFacility(facility);
        if (request.getCapacity() != null) room.setCapacity(request.getCapacity());
        if (request.getStatus() != null) room.setStatus(request.getStatus());
    }
}
