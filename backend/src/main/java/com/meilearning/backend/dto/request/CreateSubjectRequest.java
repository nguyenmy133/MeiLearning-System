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

    @NotBlank(message = "TĂªn mĂ´n há»c khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotBlank(message = "MĂ£ mĂ´n há»c khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String code;

    private String description;

    @NotBlank(message = "Danh má»¥c khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String category;

    @NotNull(message = "GiĂ¡ má»—i buá»•i khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Positive(message = "GiĂ¡ má»—i buá»•i pháº£i lá»›n hÆ¡n 0")
    private Long basePricePerSession;

    /** Danh sĂ¡ch tĂªn cÆ¡ sá»Ÿ (VD: ["CÆ¡ sá»Ÿ Quáº­n 1", "CÆ¡ sá»Ÿ Thá»§ Äá»©c"]) */
    private List<String> facilities;
}
