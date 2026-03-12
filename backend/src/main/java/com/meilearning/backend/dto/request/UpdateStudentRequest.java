package com.meilearning.backend.dto.request;

import lombok.*;
import com.meilearning.backend.entity.enums.TuitionStatus;

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
