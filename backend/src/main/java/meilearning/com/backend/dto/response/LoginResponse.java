package meilearning.com.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO cho login response.
 * Khớp với Frontend: { user: AuthUser, accessToken: string }
 */
@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {
    private UserResponse user;
    private String accessToken;
}
