package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.NotificationResponse;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getByUser(String username);
    void markAsRead(Long id);
    void markAllAsRead(String username);
}
