package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO tráº£ vá» thĂ´ng tin user.
 * Khá»›p vá»›i Frontend AuthUser: { id, name, role, email }
 */
@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String role;
    private String email;
}
