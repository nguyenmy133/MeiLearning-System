package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**

 * DTO trả về thông tin user.

 * Khá»›p với Frontend AuthUser: { id, name, role, email }

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
