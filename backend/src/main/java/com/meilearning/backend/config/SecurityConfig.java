/**

 * ============================================================================

 * SECURITY CONFIGURATION

 * ============================================================================

 *

 * Cáº¥u h¬nh Spring Security:

 * - Táº¯t CSRF (REST API stateless)

 * - Cho ph©p truy cập public các endpoints: login, register, landing data

 * - Các route khác yªu cáº§u JWT authentication

 * - Thªm JWT filter vào filter chain

 * ============================================================================

 */

package com.meilearning.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import com.meilearning.backend.security.JwtAuthenticationFilter;
import com.meilearning.backend.security.RateLimitFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // cho ph©p @PreAuthorize trªn method
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final RateLimitFilter rateLimitFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http

                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // Public endpoints

                                                .requestMatchers(

                                                                "/api/v1/auth/login",
                                                                "/api/v1/auth/change-password")

                                                .permitAll()

                                                // Swagger / OpenAPI / Actuator

                                                .requestMatchers(

                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/api-docs/**",
                                                                "/actuator/**")

                                                .permitAll()

                                                // Tất cả route khác cáº§n authenticated

                                                .anyRequest().authenticated())
                                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();

        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", config);

                return source;

        }

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();

        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config)

                        throws Exception {

                return config.getAuthenticationManager();

        }

}
