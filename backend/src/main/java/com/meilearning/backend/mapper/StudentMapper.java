package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.response.StudentResponse;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.Student;
import java.util.Collections;
import java.util.List;
@Component
public class StudentMapper {

    public StudentResponse toResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .username(student.getUser().getUsername())
                .name(student.getUser().getName())
                .email(student.getUser().getEmail())
                .phone(student.getUser().getPhone())
                .parentPhone(student.getParentPhone())
                .avatar(student.getUser().getAvatar())
                .dateOfBirth(student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null)
                .gender(student.getGender() != null ? student.getGender().name() : null)
                .grade(student.getGrade())
                .address(student.getAddress())
                .classes(mapEnrollments(student.getEnrollments()))
                .status(student.getStatus().name())
                .tuitionStatus(student.getTuitionStatus().name())
                .enrollDate(student.getEnrollDate() != null ? student.getEnrollDate().toString() : null)
                .dropDate(student.getDropDate() != null ? student.getDropDate().toString() : null)
                .dropReason(student.getDropReason())
                .dropNotes(student.getDropNotes())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    private List<StudentResponse.ClassEnrollmentResponse> mapEnrollments(List<ClassEnrollment> enrollments) {
        if (enrollments == null || enrollments.isEmpty()) return Collections.emptyList();
        return enrollments.stream()
                .map(e -> StudentResponse.ClassEnrollmentResponse.builder()
                        .classId(e.getClassEntity().getId())
                        .className(e.getClassEntity().getName())
                        .build())
                .toList();
    }
}
