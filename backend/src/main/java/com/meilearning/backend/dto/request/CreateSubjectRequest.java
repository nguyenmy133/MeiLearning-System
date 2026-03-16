package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubjectRequest {

    @NotBlank(message = "Tên môn học không được để trống")
    private String name;

    @NotBlank(message = "Mã môn học không được để trống")
    private String code;
    private String description;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    @NotNull(message = "Giá mỗi buổi không được để trống")
    @Positive(message = "Giá mỗi buổi phải lá»›n hÆ¡n 0")
    private Long basePricePerSession;

    /** Danh sách tên cơ sở (VD: ["Cơ sở Quận 1", "Cơ sở Thủ Đức"]) */

    private List<String> facilities;

}
