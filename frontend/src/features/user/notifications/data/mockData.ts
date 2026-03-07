import type { NotificationItem } from "../types";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        type: "announcement",
        title: "Thông báo nghỉ lễ Giáng sinh",
        content: "Trung tâm sẽ nghỉ từ 24/12 đến 26/12/2024. Các lớp học sẽ được bù vào tuần sau.",
        time: "2 giờ trước",
        date: "16/12/2024",
        read: false
    },
    {
        id: 2,
        type: "payment",
        title: "Nhắc nhở thanh toán học phí",
        content: "Học phí tháng 12 của bạn còn 2.500.000đ chưa thanh toán. Hạn cuối: 20/12/2024.",
        time: "5 giờ trước",
        date: "16/12/2024",
        read: false
    },
    {
        id: 3,
        type: "schedule",
        title: "Đổi phòng học",
        content: "Lớp Lý 10-B ngày 18/12 sẽ được chuyển từ phòng 203 sang phòng 205.",
        time: "1 ngày trước",
        date: "15/12/2024",
        read: true
    },
    {
        id: 4,
        type: "document",
        title: "Tài liệu mới được cập nhật",
        content: "Giáo viên đã upload bài tập tuần 2 cho lớp Lý 10-B.",
        time: "1 ngày trước",
        date: "15/12/2024",
        read: true
    },
    {
        id: 5,
        type: "announcement",
        title: "Khảo sát chất lượng giảng dạy",
        content: "Mời bạn tham gia khảo sát để giúp chúng tôi cải thiện chất lượng dạy học.",
        time: "2 ngày trước",
        date: "14/12/2024",
        read: true
    },
    {
        id: 6,
        type: "schedule",
        title: "Lịch thi cuối kỳ",
        content: "Lịch thi cuối kỳ lớp Toán 10A: 25/12/2024 lúc 08:00.",
        time: "3 ngày trước",
        date: "13/12/2024",
        read: true
    },
    {
        id: 7,
        type: "payment",
        title: "Xác nhận thanh toán",
        content: "Chúng tôi đã nhận được khoản thanh toán 5.000.000đ của bạn. Cảm ơn bạn!",
        time: "5 ngày trước",
        date: "11/12/2024",
        read: true
    },
];
