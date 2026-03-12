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
 * Khá»›p vá»›i Frontend Subject interface.
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

    /** Sá»‘ giĂ¡o viĂªn Ä‘ang dáº¡y mĂ´n nĂ y */
    private int teachers;

    /** Sá»‘ lá»›p Ä‘ang má»Ÿ cho mĂ´n nĂ y */
    private int classes;

    private String status;

    /** Danh sĂ¡ch tĂªn cÆ¡ sá»Ÿ cĂ³ dáº¡y mĂ´n nĂ y */
    private List<String> facilities;

    private Instant createdAt;
    private Instant updatedAt;
}
