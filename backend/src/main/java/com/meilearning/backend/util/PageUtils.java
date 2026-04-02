package com.meilearning.backend.util;

import org.springframework.data.domain.Page;
import com.meilearning.backend.dto.response.PageResponse;

/**

 * Utility: chuyển Spring Data Page<T> â†’ PageResponse<T> (khớp với Frontend).

 */

public final class PageUtils {

    private PageUtils() {

    }

    /**

   

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
