package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.*;
import com.meilearning.backend.entity.enums.TeacherStatus;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateTeacherRequest {
    private String name;
    private String email;
    @Pattern(
        regexp = "^(0|\\+?84)\\d{9}$",
        message = "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)"
    )
    private String phone;
    private String address;
    private String bio;
    private List<String> subjects;
    private TeacherStatus status;
}
