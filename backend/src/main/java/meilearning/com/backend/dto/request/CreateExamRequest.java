package meilearning.com.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateExamRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String subject;
    @NotNull
    private Long teacherId;
    @NotNull
    private Integer duration;          // phút
    private Integer totalQuestions;
    private String startTime;          // ISO-8601
    private String endTime;
    private List<Long> classIds;       // classes tham gia
}
