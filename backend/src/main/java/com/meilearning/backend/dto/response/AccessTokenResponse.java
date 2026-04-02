package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Response khi refresh token thành công.
 * Chỉ trả về access token mới — refresh token vẫn nằm trong HttpOnly cookie.
 */
@Getter
@Builder
@AllArgsConstructor
public class AccessTokenResponse {
    private String accessToken;
}
