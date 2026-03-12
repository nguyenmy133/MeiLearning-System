/**
 * ============================================================================
 * OPENAPI / SWAGGER CONFIGURATION
 * ============================================================================
 *
 * Cáº¥u hĂ¬nh Swagger UI cho MeiLearning System API.
 * Truy cáº­p: http://localhost:8080/swagger-ui.html
 * ============================================================================
 */
package com.meilearning.backend.config;

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
                        .description("REST API cho há»‡ thá»‘ng quáº£n lĂ½ trung tĂ¢m dáº¡y thĂªm MeiLearning")
                        .contact(new Contact()
                                .name("MeiLearning Team")))
                // Cáº¥u hĂ¬nh JWT Bearer token cho Swagger UI
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nháº­p JWT token (khĂ´ng cáº§n prefix 'Bearer ')")));
    }
}
