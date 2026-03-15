package com.meilearning.backend.util;

import org.springframework.data.domain.Page;
import com.meilearning.backend.dto.response.PageResponse;

/**

 * Utility: chuyển Spring Data Page<T> â†’ PageResponse<T> (khá»›p với Frontend).

 */

public final class PageUtils {

    private PageUtils() {

    }

    /**

     * Chuyá»ƒn Ä‘á»•i Spring Data Page â†’ PageResponse DTO.

     *

     * @param page Spring Data page result

     * @return PageResponse khá»›p format Frontend PaginatedResponse<T>

     */

    public static <T> PageResponse<T> toPageResponse(Page<T> page) {

        return PageResponse.<T>builder()

                .data(page.getContent())
                .total(page.getTotalElements())
                .page(page.getNumber() + 1) // Spring d¹ng 0-based, Frontend d¹ng 1-based
                .limit(page.getSize())
                .totalPages(page.getTotalPages())
                .build();

    }

}
