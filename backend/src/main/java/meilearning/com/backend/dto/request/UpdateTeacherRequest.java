package meilearning.com.backend.dto.request;

import lombok.*;
import meilearning.com.backend.entity.enums.TeacherStatus;

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
