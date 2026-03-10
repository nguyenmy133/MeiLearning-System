package meilearning.com.backend.util;

import org.springframework.data.domain.Page;

import meilearning.com.backend.dto.response.PageResponse;

/**
 * Utility: chuyển Spring Data Page<T> → PageResponse<T> (khớp với Frontend).
 */
public final class PageUtils {

    private PageUtils() {
    }

    /**
     * Chuyển đổi Spring Data Page → PageResponse DTO.
     *
     * @param page Spring Data page result
     * @return PageResponse khớp format Frontend PaginatedResponse<T>
     */
    public static <T> PageResponse<T> toPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .data(page.getContent())
                .total(page.getTotalElements())
                .page(page.getNumber() + 1) // Spring dùng 0-based, Frontend dùng 1-based
                .limit(page.getSize())
                .totalPages(page.getTotalPages())
                .build();
    }
}
