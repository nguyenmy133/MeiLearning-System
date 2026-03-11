/**
 * ============================================================================
 * OPENAPI / SWAGGER CONFIGURATION
 * ============================================================================
 *
 * Cấu hình Swagger UI cho MeiLearning System API.
 * Truy cập: http://localhost:8080/swagger-ui.html
 * ============================================================================
 */
package meilearning.com.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI meiLearningOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("MeiLearning System API")
                        .version("1.0.0")
                        .description("REST API cho hệ thống quản lý trung tâm dạy thêm MeiLearning")
                        .contact(new Contact()
                                .name("MeiLearning Team")))
                // Cấu hình JWT Bearer token cho Swagger UI
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT token (không cần prefix 'Bearer ')")));
    }
}
