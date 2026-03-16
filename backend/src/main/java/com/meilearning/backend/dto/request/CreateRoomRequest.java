package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotBlank(message = "Tên ph²ng không được để trống")
    private String name;

    @NotNull(message = "Cơ sở không được để trống")
    private Long facilityId;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tá»‘i thiểu là 1")
    @Max(value = 200, message = "Sức chứa tá»‘i đa là 200")
    private Integer capacity;

}
