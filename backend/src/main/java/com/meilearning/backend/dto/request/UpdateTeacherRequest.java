package com.meilearning.backend.dto.request;

import lombok.*;
import com.meilearning.backend.entity.enums.TeacherStatus;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateTeacherRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String bio;
    private List<String> subjects;
    private TeacherStatus status;
}
