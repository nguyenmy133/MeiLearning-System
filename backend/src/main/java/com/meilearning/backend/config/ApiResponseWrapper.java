package com.meilearning.backend.config;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import com.meilearning.backend.dto.response.ApiResponse;
import com.meilearning.backend.exception.ErrorResponse;

/**
 * Auto-wrap tất cả response từ controllers vào ApiResponse.
 * Nếu controller đã trả về ApiResponse, sẽ không wrap lại lần nữa.
 *
 * Kết quả: Tất cả API endpoint đều trả về format:
 * { "data": T, "message": "..." }
 */
@RestControllerAdvice(basePackages = "com.meilearning.backend.controller")
public class ApiResponseWrapper implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> paramType = returnType.getParameterType();
        // Không wrap nếu đã là ApiResponse
        if (paramType.equals(ApiResponse.class) || ApiResponse.class.isAssignableFrom(paramType)) {
            return false;
        }
        // Không wrap nếu trả về file/binary
        if (byte[].class.equals(paramType) || org.springframework.core.io.Resource.class.isAssignableFrom(paramType)) {
            return false;
        }
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                   MethodParameter returnType,
                                   MediaType selectedContentType,
                                   Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                   ServerHttpRequest request,
                                   ServerHttpResponse response) {

        // Skip nếu body đã là ApiResponse
        if (body instanceof ApiResponse) {
            return body;
        }
        
        // Skip byte[] or File/Resource responses
        if (body instanceof byte[] || body instanceof org.springframework.core.io.Resource) {
            return body;
        }

        // Bug fix: Skip ErrorResponse từ GlobalExceptionHandler — không double-wrap
        // ErrorResponse có format riêng { status, message, errors, timestamp }
        if (body instanceof ErrorResponse) {
            return body;
        }

        // Bug fix: KHÔNG wrap null body thành 200 OK
        // Controller dùng ResponseEntity.noContent().build() → Spring set status 204
        // Nếu wrap null → Spring thấy có body → đổi thành 200 → FE mất 204
        if (body == null) {
            return null;
        }

        // Swagger/OpenAPI endpoint không wrap
        String path = request.getURI().getPath();
        if (path.contains("/v3/api-docs") || path.contains("/swagger")) {
            return body;
        }

        return ApiResponse.ok(body);
    }

}
