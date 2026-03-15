package com.meilearning.backend.dto.request;

import lombok.*;
import com.meilearning.backend.entity.enums.ClassStatus;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateClassRequest {
    private String name;
    private String subject;
    private Long teacherId;
    private String facility;
    private String room;
    private Integer maxStudents;
    private Long pricePerSession;
    private List<CreateClassRequest.SessionSlotDTO> schedule;
    private String startDate;
    private String description;
    private ClassStatus status;
}
