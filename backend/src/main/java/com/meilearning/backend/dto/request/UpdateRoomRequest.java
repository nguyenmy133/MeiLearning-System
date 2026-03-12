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

    @Min(value = 1, message = "Sá»©c chá»©a tá»‘i thiá»ƒu lĂ  1")
    @Max(value = 200, message = "Sá»©c chá»©a tá»‘i Ä‘a lĂ  200")
    private Integer capacity;

    private RoomStatus status;
}
