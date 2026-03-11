package meilearning.com.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import meilearning.com.backend.entity.enums.SubjectStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSubjectRequest {

    private String name;
    private String code;
    private String description;
    private String category;
    private Long basePricePerSession;
    private List<String> facilities;
    private SubjectStatus status;
}
