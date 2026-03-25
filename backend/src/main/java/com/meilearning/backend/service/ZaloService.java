package com.meilearning.backend.service;

import java.util.Map;

/**
 * Zalo Official Account Service — gửi ZNS (Zalo Notification Service).
 * Khi chưa cấu hình OA → isEnabled() = false → skip.
 */
public interface ZaloService {

    /**
     * Gửi ZNS template message.
     *
     * @param phone      số điện thoại người nhận (VD: "0973xxx")
     * @param templateId ZNS template ID đã được Zalo duyệt
     * @param data       dữ liệu fill vào template
     * @return true nếu gửi thành công
     */
    boolean sendZns(String phone, String templateId, Map<String, String> data);

    /** Kiểm tra Zalo OA đã được cấu hình chưa */
    boolean isEnabled();
}
