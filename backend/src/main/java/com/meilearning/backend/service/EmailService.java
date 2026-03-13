package com.meilearning.backend.service;

/**
 * Service gửi email — abstraction cho SMTP/SendGrid/etc.
 */
public interface EmailService {

    /**
     * Gửi email HTML.
     *
     * @param to      email người nhận
     * @param subject tiêu đề
     * @param htmlBody nội dung HTML
     */
    void sendHtml(String to, String subject, String htmlBody);

    /**
     * Gửi email text thuần.
     */
    void sendText(String to, String subject, String textBody);
}
