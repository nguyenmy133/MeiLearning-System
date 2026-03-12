package com.meilearning.backend.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO phĂ¢n trang dĂ¹ng chung.
 * Khá»›p vá»›i Frontend PaginatedResponse<T>.
 */
@Getter
@Builder
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> data;
    private long total;
    private int page;
    private int limit;
    private int totalPages;
}
