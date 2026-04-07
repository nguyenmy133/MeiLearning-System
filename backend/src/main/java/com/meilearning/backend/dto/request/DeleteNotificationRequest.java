package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import java.util.List;

/**
 * Request body cho DELETE /notifications/batch
 * Xóa danh sách thông báo theo ID (chỉ của user hiện tại).
 */
@Getter
public class DeleteNotificationRequest {

    @NotEmpty(message = "Danh sách ID không được rỗng")
    private List<Long> ids;
}
