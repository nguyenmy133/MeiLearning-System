package com.meilearning.backend.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import com.meilearning.backend.dto.request.CreateSubjectRequest;
import com.meilearning.backend.dto.request.UpdateSubjectRequest;
import com.meilearning.backend.dto.response.SubjectResponse;
import com.meilearning.backend.entity.Subject;

import java.util.Collections;
import java.util.List;

/**
 * Subject mapper â€” manual implementation thay vĂ¬ MapStruct
 * vĂ¬ cáº§n xá»­ lĂ½ JSON conversion cho facilities field.
 */
@Component
public class SubjectMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Subject toEntity(CreateSubjectRequest request) {
        return Subject.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .category(request.getCategory())
                .basePricePerSession(request.getBasePricePerSession())
                .facilitiesJson(toJson(request.getFacilities()))
                .build();
    }

    public SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .description(subject.getDescription())
                .category(subject.getCategory())
                .basePricePerSession(subject.getBasePricePerSession())
                .teachers(subject.getTeachers() != null ? subject.getTeachers().size() : 0)
                .classes(subject.getClasses() != null ? subject.getClasses().size() : 0)
                .status(subject.getStatus().name())
                .facilities(fromJson(subject.getFacilitiesJson()))
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }

    public void updateEntity(UpdateSubjectRequest request, Subject subject) {
        if (request.getName() != null) subject.setName(request.getName());
        if (request.getCode() != null) subject.setCode(request.getCode());
        if (request.getDescription() != null) subject.setDescription(request.getDescription());
        if (request.getCategory() != null) subject.setCategory(request.getCategory());
        if (request.getBasePricePerSession() != null) subject.setBasePricePerSession(request.getBasePricePerSession());
        if (request.getFacilities() != null) subject.setFacilitiesJson(toJson(request.getFacilities()));
        if (request.getStatus() != null) subject.setStatus(request.getStatus());
    }

    // â”€â”€ JSON helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private String toJson(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
