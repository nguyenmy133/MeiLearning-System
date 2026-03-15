package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.response.NotificationResponse;
import com.meilearning.backend.entity.Notification;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.NotificationRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.NotificationService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getByUser(String username) {
        User user = findUser(username);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo: " + id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String username) {
        User user = findUser(username);
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
    }

    private NotificationResponse toResponse(Notification n) {
        var zonedTime = n.getCreatedAt().atZone(ZoneId.systemDefault());
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .content(n.getContent())
                .time(zonedTime.format(TIME_FMT))
                .date(zonedTime.format(DATE_FMT))
                .read(Boolean.TRUE.equals(n.getIsRead()))
                .build();
    }
}
