package com.meilearning.backend.service;

import com.meilearning.backend.entity.Notification;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.entity.enums.NotificationSeverity;
import com.meilearning.backend.repository.NotificationRepository;
import com.meilearning.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Notification Dispatcher — quyết định gửi qua kênh nào dựa trên severity.
 *
 * LOW    → In-App only
 * MEDIUM → In-App + Email
 * HIGH   → In-App + Email + SMS + Zalo ZNS
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatcher {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final ZaloService zaloService;

    /**
     * Dispatch thông báo qua các kênh phù hợp.
     */
    @Transactional
    public void dispatch(User user, String type, String title, String content,
                         NotificationSeverity severity) {
        log.info("📢 Dispatching [{}] notification to {}: {}", severity, user.getUsername(), title);

        // 1. ALWAYS: Lưu In-App notification
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .severity(severity)
                .build();

        // 2. MEDIUM+: Gửi Email (nếu user có email)
        if (severity.ordinal() >= NotificationSeverity.MEDIUM.ordinal()) {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                try {
                    String htmlBody = buildEmailHtml(type, title, content, user.getName());
                    emailService.sendHtml(user.getEmail(),
                            "[MeiLearning] " + title, htmlBody);
                    notification.setEmailSent(true);
                } catch (Exception e) {
                    log.error("❌ Email dispatch failed for {}: {}", user.getEmail(), e.getMessage());
                }
            } else {
                log.warn("⚠️ User {} has no email — skipping email notification", user.getUsername());
            }
        }

        // 3. HIGH: Gửi SMS + Zalo ZNS (ưu tiên parentPhone cho student)
        if (severity == NotificationSeverity.HIGH) {
            String phone = resolvePhone(user);
            if (phone != null && !phone.isBlank()) {
                // SMS
                try {
                    String smsContent = truncateForSms(title + ": " + content);
                    boolean sent = smsService.sendSms(phone, smsContent);
                    notification.setSmsSent(sent);
                } catch (Exception e) {
                    log.error("❌ SMS dispatch failed for {}: {}", phone, e.getMessage());
                }

                // Zalo ZNS
                if (zaloService.isEnabled()) {
                    try {
                        Map<String, String> znsData = Map.of(
                                "title", title,
                                "content", content,
                                "student_name", user.getName() != null ? user.getName() : ""
                        );
                        zaloService.sendZns(phone, null, znsData);
                    } catch (Exception e) {
                        log.error("❌ Zalo ZNS dispatch failed for {}: {}", phone, e.getMessage());
                    }
                }
            } else {
                log.warn("⚠️ No phone number found for user {} — skipping SMS/Zalo", user.getUsername());
            }
        }

        notificationRepository.save(notification);
        log.info("✅ Notification saved [id={}, channels: inApp=true, email={}, sms={}]",
                notification.getId(), notification.getEmailSent(), notification.getSmsSent());
    }

    /** Shortcut: dispatch LOW severity (In-App only) */
    public void notifyInApp(User user, String type, String title, String content) {
        dispatch(user, type, title, content, NotificationSeverity.LOW);
    }

    /** Shortcut: dispatch MEDIUM severity (In-App + Email) */
    public void notifyWithEmail(User user, String type, String title, String content) {
        dispatch(user, type, title, content, NotificationSeverity.MEDIUM);
    }

    /** Shortcut: dispatch HIGH severity (In-App + Email + SMS + Zalo) */
    public void notifyUrgent(User user, String type, String title, String content) {
        dispatch(user, type, title, content, NotificationSeverity.HIGH);
    }

    /** Resolve phone number — cho student ưu tiên parentPhone. */
    private String resolvePhone(User user) {
        if (user.getRole() == User.Role.student) {
            return studentRepository.findByUserId(user.getId())
                    .map(Student::getParentPhone)
                    .filter(p -> p != null && !p.isBlank())
                    .orElse(user.getPhone());
        }
        return user.getPhone();
    }

    private String truncateForSms(String text) {
        if (text == null) return "";
        return text.length() <= 155 ? text : text.substring(0, 152) + "...";
    }

    private String buildEmailHtml(String type, String title, String content, String userName) {
        return """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 24px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 20px;">🔔 MeiLearning</h1>
                    </div>
                    <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
                        <p style="color: #4a5568; margin: 0 0 8px;">Xin chào <strong>%s</strong>,</p>
                        <h2 style="color: #2d3748; margin: 16px 0 8px; font-size: 18px;">%s</h2>
                        <p style="color: #4a5568; line-height: 1.6;">%s</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                            Đây là email tự động từ hệ thống MeiLearning. Vui lòng không trả lời email này.
                        </p>
                    </div>
                </div>
                """.formatted(userName, title, content);
    }
}
