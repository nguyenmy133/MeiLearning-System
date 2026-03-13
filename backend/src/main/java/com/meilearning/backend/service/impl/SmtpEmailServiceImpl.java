package com.meilearning.backend.service.impl;

import com.meilearning.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service — gửi email qua SMTP (SendGrid / Gmail / etc.)
 * Chạy async để không block business logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmtpEmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@meilearning.vn}")
    private String fromEmail;

    @Override
    @Async("notificationExecutor")
    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
            log.info("📧 Email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
            // Retry 1 lần
            try {
                Thread.sleep(2000);
                MimeMessage retryMsg = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(retryMsg, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);
                mailSender.send(retryMsg);
                log.info("📧 Email retry success to {}", to);
            } catch (Exception retryEx) {
                log.error("❌ Email retry also failed to {}: {}", to, retryEx.getMessage());
            }
        }
    }

    @Override
    @Async("notificationExecutor")
    public void sendText(String to, String subject, String textBody) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(textBody);

            mailSender.send(message);
            log.info("📧 Text email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("❌ Failed to send text email to {}: {}", to, e.getMessage());
        }
    }
}
