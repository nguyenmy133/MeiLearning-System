package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**

 * Generic API response wrapper.

 * Tất cả endpoint trả về format: { data: T, message: String }

 * Frontend interceptor sẽ unwrap láº¥y response.data â†’ { data, message }

 * Rá»“i service destructure: const { data } = await apiClient.get(...)

 */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private T data;
    private String message;

    // â”€â”€ Factory methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public static <T> ApiResponse<T> ok(T data) {

        return ApiResponse.<T>builder()

                .data(data)
                .message("Thành công")
                .build();

    }

    public static <T> ApiResponse<T> ok(T data, String message) {

        return ApiResponse.<T>builder()

                .data(data)
                .message(message)
                .build();

    }

    public static <T> ApiResponse<T> created(T data) {

        return ApiResponse.<T>builder()

                .data(data)
                .message("Tạo má»›i thành công")
                .build();

    }

    public static <T> ApiResponse<T> deleted() {

        return ApiResponse.<T>builder()

                .data(null)
                .message("X³a thành công")
                .build();

    }

    public static <T> ApiResponse<T> error(String message) {

        return ApiResponse.<T>builder()

                .data(null)
                .message(message)
                .build();

    }

}
