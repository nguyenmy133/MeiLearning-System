package com.meilearning.backend.util;

import org.springframework.data.jpa.domain.Specification;

/**
 * Helper class cho Specification queries — tránh verbose cast.
 * Sử dụng: SpecHelper.<Teacher>empty() thay vì Specification.where((Specification<Teacher>) null)
 */
public final class SpecHelper {

    private SpecHelper() {}

    /**
     * Tạo Specification rỗng (match all) — tương đương Specification.where(null)
     * nhưng không cần explicit cast.
     */
    public static <T> Specification<T> empty() {
        return (root, query, cb) -> null; // null Predicate = match all
    }
}
