package meilearning.com.backend.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import meilearning.com.backend.dto.request.CreateClassRequest;
import meilearning.com.backend.dto.response.ClassResponse;
import meilearning.com.backend.entity.ClassEntity;

import java.util.Collections;
import java.util.List;

@Component
public class ClassMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClassResponse toResponse(ClassEntity entity) {
        return ClassResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .subject(entity.getSubject().getName())
                .teacher(ClassResponse.TeacherRef.builder()
                        .id(entity.getTeacher().getId())
                        .name(entity.getTeacher().getUser().getName())
                        .avatar(entity.getTeacher().getUser().getAvatar())
                        .build())
                .facility(entity.getRoom() != null ? entity.getRoom().getFacility().getName() : null)
                .room(entity.getRoom() != null ? entity.getRoom().getName() : null)
                .students(entity.getEnrollments() != null ? entity.getEnrollments().size() : 0)
                .maxStudents(entity.getMaxStudents())
                .pricePerSession(entity.getPricePerSession())
                .schedule(parseSchedule(entity.getSchedule()))
                .startDate(entity.getStartDate() != null ? entity.getStartDate().toString() : null)
                .endDate(entity.getEndDate() != null ? entity.getEndDate().toString() : null)
                .status(entity.getStatus().name())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public String scheduleToJson(List<CreateClassRequest.SessionSlotDTO> slots) {
        if (slots == null || slots.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(slots);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<ClassResponse.SessionSlotResponse> parseSchedule(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
