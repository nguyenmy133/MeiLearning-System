package meilearning.com.backend.dto.response;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TeacherResponse {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String avatar;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String bio;
    private List<String> subjects;
    private int classCount;
    private String status;
    private String joinDate;
    private Instant createdAt;
    private Instant updatedAt;
}
