package meilearning.com.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/**
 * Subject response DTO.
 * Khớp với Frontend Subject interface.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String category;
    private Long basePricePerSession;

    /** Số giáo viên đang dạy môn này */
    private int teachers;

    /** Số lớp đang mở cho môn này */
    private int classes;

    private String status;

    /** Danh sách tên cơ sở có dạy môn này */
    private List<String> facilities;

    private Instant createdAt;
    private Instant updatedAt;
}
