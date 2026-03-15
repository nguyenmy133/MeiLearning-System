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

    @NotBlank(message = "Danh má»¥c không được để trống")
    private String category;

    @NotNull(message = "Giá má»—i buổi không được để trống")
    @Positive(message = "Giá má»—i buổi pháº£i lá»›n hÆ¡n 0")
    private Long basePricePerSession;

    /** Danh sách tªn cơ sở (VD: ["CÆ¡ sở Quáº­n 1", "CÆ¡ sở Thá»§ Äá»©c"]) */

    private List<String> facilities;

}
