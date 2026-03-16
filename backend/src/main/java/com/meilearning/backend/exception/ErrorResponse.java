package com.meilearning.backend.exception;

import java.time.Instant;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**

 * Cáº¥u trºc JSON trả về cho tất cả lỗi.

 * Khá»›p với ApiErrorResponse ở Frontend.

 */

@Getter
@Builder
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
    private Map<String, String> errors;
    private Instant timestamp;

}
