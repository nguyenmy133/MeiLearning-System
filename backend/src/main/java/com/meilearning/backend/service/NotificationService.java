package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.SendNotificationRequest;
import com.meilearning.backend.dto.response.NotificationResponse;
import com.meilearning.backend.dto.response.PageResponse;
import java.util.List;

public interface NotificationService {
    PageResponse<NotificationResponse> getByUser(String username, int page, int limit);
    List<NotificationResponse> getByUser(String username);
    void markAsRead(Long id);
    void markAllAsRead(String username);
    void sendNotification(SendNotificationRequest request, String senderUsername);
}
