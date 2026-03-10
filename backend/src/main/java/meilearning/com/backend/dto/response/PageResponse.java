package meilearning.com.backend.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO phân trang dùng chung.
 * Khớp với Frontend PaginatedResponse<T>.
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
