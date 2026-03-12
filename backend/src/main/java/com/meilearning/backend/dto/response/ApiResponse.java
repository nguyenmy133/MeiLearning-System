package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Generic API response wrapper.
 * Táº¥t cáº£ endpoint tráº£ vá» format: { data: T, message: String }
 * Frontend interceptor sáº½ unwrap láº¥y response.data â†’ { data, message }
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
                .message("ThĂ nh cĂ´ng")
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
                .message("Táº¡o má»›i thĂ nh cĂ´ng")
                .build();
    }

    public static <T> ApiResponse<T> deleted() {
        return ApiResponse.<T>builder()
                .data(null)
                .message("XĂ³a thĂ nh cĂ´ng")
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .data(null)
                .message(message)
                .build();
    }
}
