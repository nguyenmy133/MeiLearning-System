# Kế hoạch Tự động hóa hệ thống Học phí

## 1. Backend
- Tạo `TuitionScheduler.java`.
- Chặn hàm `generateMonthlyInvoices` trong `TuitionServiceImpl.java`, ném lỗi nếu gen sớm hơn tháng hiện tại.
- Định nghĩa cron `@Scheduled(cron = "0 0 0 1 * ?")` để tự động kích hoạt tiến trình tạo hóa đơn.

## 2. Frontend
- Cập nhật UI Admin Tuition để khóa việc tạo batch bills cho tháng hiện tại.
