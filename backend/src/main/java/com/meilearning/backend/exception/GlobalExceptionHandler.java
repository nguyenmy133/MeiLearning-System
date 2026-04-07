/**

 * ============================================================================

 * GLOBAL EXCEPTION HANDLER

 * ============================================================================

 *

 * Xử lý tập trung tất cả exception -> trả về JSON response nhất quán.
 * Frontend nhận được format cố định để hiển thị lỗi.
 * ============================================================================

 */

package com.meilearning.backend.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**

     * Xử lý lỗi validation (@Valid / @Validated)

     */

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {

            String field = ((FieldError) error).getField();

            String message = error.getDefaultMessage();

            errors.put(field, message);

        });

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .errors(errors)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.badRequest().body(body);

    }

    /**

     * Xử lý ResourceNotFoundException (404)

     */

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);

    }

    /**

     * Xử lý BusinessException (422 Unprocessable Entity)

     */

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {

        ErrorResponse body = ErrorResponse.builder()
                .status(422)
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(422).body(body);

    }

    /**

     * Xử lý DuplicateResourceException (409 Conflict)

     */

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);

    }

    /**
     * Xử lý lỗi client disconnect (đặc biệt khi dùng SSE)
     */
    @ExceptionHandler(org.springframework.web.context.request.async.AsyncRequestNotUsableException.class)
    public ResponseEntity<Void> handleAsyncRequestNotUsableException(Exception ex) {
        log.debug("Client disconnected during async request (SSE): {}", ex.getMessage());
        return ResponseEntity.ok().build();
    }

    /**
     * Catch-all cho mọi exception chưa handle
     */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        
        // Bỏ qua lỗi broken pipe / client abort nếu nó rơi vào catch-all
        if (ex.getClass().getName().contains("ClientAbortException") || 
            (ex.getMessage() != null && ex.getMessage().contains("Broken pipe"))) {
            log.debug("Client aborted connection: {}", ex.getMessage());
            return ResponseEntity.ok().build();
        }

        log.error("Unhandled exception", ex);

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);

    }

}
