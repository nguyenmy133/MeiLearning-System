package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.List;

/**

 * Subject response DTO.

 * Khá»›p với Frontend Subject interface.

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

    /** Sá»‘ giáo viên Ä‘ang dáº¡y môn này */

    private int teachers;

    /** Sá»‘ lớp Ä‘ang má»Ÿ cho môn này */

    private int classes;
    private String status;

    /** Danh sách tªn cơ sở có dáº¡y môn này */

    private List<String> facilities;
    private Instant createdAt;
    private Instant updatedAt;

}
