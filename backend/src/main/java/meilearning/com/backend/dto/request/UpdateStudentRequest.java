package meilearning.com.backend.dto.request;

import lombok.*;
import meilearning.com.backend.entity.enums.TuitionStatus;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateStudentRequest {
    private String name;
    private String email;
    private String phone;
    private String parentPhone;
    private String address;
    private List<CreateStudentRequest.ClassEnrollmentDTO> classes;
    private TuitionStatus tuitionStatus;
}
