package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.RoomStatus;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomRequest {

    private String name;
    private Long facilityId;

    @Min(value = 1, message = "Sức chứa tá»‘i thiểu là 1")
    @Max(value = 200, message = "Sức chứa tá»‘i đa là 200")
    private Integer capacity;
    private RoomStatus status;

}
