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
 * Auto-wrap táº¥t cáº£ response tá»« controllers vĂ o ApiResponse.
 * Náº¿u controller Ä‘Ă£ tráº£ vá» ApiResponse, sáº½ khĂ´ng wrap láº¡i láº§n ná»¯a.
 * 
 * Káº¿t quáº£: Táº¥t cáº£ API endpoint Ä‘á»u tráº£ vá» format:
 * { "data": T, "message": "..." }
 */
@RestControllerAdvice(basePackages = "com.meilearning.backend.controller")
public class ApiResponseWrapper implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // KhĂ´ng wrap náº¿u Ä‘Ă£ lĂ  ApiResponse
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
        // Skip náº¿u body Ä‘Ă£ lĂ  ApiResponse
        if (body instanceof ApiResponse) {
            return body;
        }

        // Skip null body (204 No Content)
        if (body == null) {
            return ApiResponse.ok(null, "ThĂ nh cĂ´ng");
        }

        // Swagger/OpenAPI endpoint khĂ´ng wrap
        String path = request.getURI().getPath();
        if (path.contains("/v3/api-docs") || path.contains("/swagger")) {
            return body;
        }

        return ApiResponse.ok(body);
    }
}
