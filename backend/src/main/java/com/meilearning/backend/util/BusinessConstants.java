package com.meilearning.backend.util;

import java.math.BigDecimal;

/**
 * Business constants — thay thế magic numbers trong code.
 * Giá trị có thể thay đổi theo yêu cầu nghiệp vụ.
 *
 * Lưu ý: LATE_THRESHOLD_MINUTES không đặt ở đây
 * vì Admin có thể config động qua QrSettings.
 */
public final class BusinessConstants {

    private BusinessConstants() {}

    /** Giới hạn ký tự tin nhắn SMS (SpeedSMS) */
    public static final int SMS_MAX_LENGTH = 155;

    /** Ngưỡng đạt/trượt bài kiểm tra (0-100 scale) */
    public static final BigDecimal PASSING_SCORE = BigDecimal.valueOf(50);

    /** Ngày tính due date học phí = ngày X tháng sau */
    public static final int TUITION_DUE_DAY = 10;
}
