package com.meilearning.backend.config;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import com.meilearning.backend.dto.response.ApiResponse;

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

        // Không wrap nếu đã là ApiResponse

        return !returnType.getParameterType().equals(ApiResponse.class)

                && !ApiResponse.class.isAssignableFrom(returnType.getParameterType());

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

        // Skip null body (204 No Content)

        if (body == null) {
            return ApiResponse.ok(null, "Thành công");

        }

        // Swagger/OpenAPI endpoint không wrap

        String path = request.getURI().getPath();

        if (path.contains("/v3/api-docs") || path.contains("/swagger")) {
            return body;

        }

        return ApiResponse.ok(body);

    }

}
