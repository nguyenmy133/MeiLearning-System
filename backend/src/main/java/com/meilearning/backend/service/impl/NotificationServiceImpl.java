package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.SendNotificationRequest;
import com.meilearning.backend.dto.response.NotificationResponse;
import com.meilearning.backend.entity.Notification;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.entity.enums.NotificationSeverity;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.NotificationRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.service.NotificationService;
import com.meilearning.backend.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationDispatcher notificationDispatcher;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getByUser(String username, int page, int limit) {
        User user = findUser(username);
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Notification> result = notificationRepository.findByUserId(user.getId(), pageable);
        return PageResponse.<NotificationResponse>builder()
                .data(result.getContent().stream().map(this::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

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

    @Override
    public void sendNotification(SendNotificationRequest request, String senderUsername) {
        NotificationSeverity severity = NotificationSeverity.LOW;
        if (request.getSeverity() != null) {
            try {
                severity = NotificationSeverity.valueOf(request.getSeverity().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Default to LOW
            }
        }

        List<User> recipients;

        if (request.getUserId() != null) {
            // Gửi cho 1 user cụ thể
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy user: " + request.getUserId()));
            recipients = List.of(user);
        } else if (request.getRole() != null) {
            // Broadcast theo role
            User.Role role = User.Role.valueOf(request.getRole().toLowerCase());
            recipients = userRepository.findByRole(role);
        } else {
            // Broadcast cho tất cả
            recipients = userRepository.findAll();
        }

        // Loại bỏ người gửi ra khỏi danh sách người nhận
        recipients = recipients.stream()
                .filter(u -> !u.getUsername().equals(senderUsername))
                .toList();

        for (User recipient : recipients) {
            notificationDispatcher.dispatch(
                    recipient,
                    "admin_broadcast",
                    request.getTitle(),
                    request.getContent(),
                    severity
            );
        }
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
