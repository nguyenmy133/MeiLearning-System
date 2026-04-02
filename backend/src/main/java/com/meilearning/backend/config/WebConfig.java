package com.meilearning.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serve static files from the uploads directory.
 * URL: /uploads/** → file system: uploads/
 *
 * Explicit MIME mapping ensures correct Content-Type for PDF, DOC, etc.
 * Critical for production where X-Content-Type-Options: nosniff is set.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@SuppressWarnings("null") ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(3600); // 1 hour cache for uploaded files
    }

    @SuppressWarnings("null")
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(false)
                .ignoreAcceptHeader(false)
                .defaultContentType(MediaType.APPLICATION_OCTET_STREAM)
                .mediaType("pdf", MediaType.APPLICATION_PDF)
                .mediaType("doc", MediaType.valueOf("application/msword"))
                .mediaType("docx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .mediaType("ppt", MediaType.valueOf("application/vnd.ms-powerpoint"))
                .mediaType("pptx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                .mediaType("mp4", MediaType.valueOf("video/mp4"))
                .mediaType("mov", MediaType.valueOf("video/quicktime"))
                .mediaType("jpg", MediaType.IMAGE_JPEG)
                .mediaType("jpeg", MediaType.IMAGE_JPEG)
                .mediaType("png", MediaType.IMAGE_PNG)
                .mediaType("gif", MediaType.IMAGE_GIF);
    }
}
