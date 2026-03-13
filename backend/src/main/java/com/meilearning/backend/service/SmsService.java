package com.meilearning.backend.service;

/**
 * Service gửi SMS — abstraction cho SpeedSMS/Twilio/etc.
 */
public interface SmsService {

    /**
     * Gửi tin nhắn SMS.
     *
     * @param phoneNumber số điện thoại (VD: "0973734061" hoặc "84973734061")
     * @param message     nội dung tin nhắn (max 160 ký tự)
     * @return true nếu gửi thành công
     */
    boolean sendSms(String phoneNumber, String message);
}
