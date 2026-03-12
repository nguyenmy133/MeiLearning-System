package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.request.UpdateTeacherRequest;
import com.meilearning.backend.dto.response.TeacherResponse;
import com.meilearning.backend.entity.Subject;
import com.meilearning.backend.entity.Teacher;

import java.util.Collections;
import java.util.List;

@Component
public class TeacherMapper {

    public TeacherResponse toResponse(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .name(teacher.getUser().getName())
                .username(teacher.getUser().getUsername())
                .email(teacher.getUser().getEmail())
                .phone(teacher.getUser().getPhone())
                .avatar(teacher.getUser().getAvatar())
                .dateOfBirth(teacher.getDateOfBirth() != null ? teacher.getDateOfBirth().toString() : null)
                .gender(teacher.getGender() != null ? teacher.getGender().name() : null)
                .address(teacher.getAddress())
                .bio(teacher.getBio())
                .subjects(getSubjectNames(teacher))
                .classCount(teacher.getClasses() != null ? teacher.getClasses().size() : 0)
                .status(teacher.getStatus().name())
                .joinDate(teacher.getJoinDate() != null ? teacher.getJoinDate().toString() : null)
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .build();
    }

    public void updateEntity(UpdateTeacherRequest request, Teacher teacher) {
        if (request.getName() != null) teacher.getUser().setName(request.getName());
        if (request.getEmail() != null) teacher.getUser().setEmail(request.getEmail());
        if (request.getPhone() != null) teacher.getUser().setPhone(request.getPhone());
        if (request.getAddress() != null) teacher.setAddress(request.getAddress());
        if (request.getBio() != null) teacher.setBio(request.getBio());
        if (request.getStatus() != null) teacher.setStatus(request.getStatus());
    }

    private List<String> getSubjectNames(Teacher teacher) {
        if (teacher.getSubjects() == null || teacher.getSubjects().isEmpty()) {
            return Collections.emptyList();
        }
        return teacher.getSubjects().stream()
                .map(Subject::getName)
                .toList();
    }
}
