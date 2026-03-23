package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class QrTokenResponse {
    /** UUID token string */
    private String token;
    /** Thời gian hết hạn */
    private Instant expiresAt;
    /** Số phút hiệu lực */
    private int expiryMinutes;
    /** Session ID */
    private Long sessionId;
}
