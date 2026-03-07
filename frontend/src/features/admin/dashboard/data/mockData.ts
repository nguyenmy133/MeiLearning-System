import {
  DashboardStatData,
  DailyRevenue,
  TodaySession,
  TodayAttendance,
  DashboardAlert,
  OverdueStudent,
} from "../types";

export const mockStats: DashboardStatData[] = [
  { label: "Tổng học viên", value: "1,234", change: "+12%", trend: "up" },
  { label: "Giáo viên", value: "52", change: "+3", trend: "up" },
  { label: "Lớp đang mở", value: "48", change: "-2", trend: "down" },
  { label: "Doanh thu tháng", value: "450M", change: "+8%", trend: "up" },
];

export const mockRevenueData: DailyRevenue[] = [
  { day: "T2", revenue: 12.5 },
  { day: "T3", revenue: 8.2 },
  { day: "T4", revenue: 15.8 },
  { day: "T5", revenue: 11.3 },
  { day: "T6", revenue: 18.6 },
  { day: "T7", revenue: 22.1 },
  { day: "CN", revenue: 9.4 },
];

export const mockTodaySchedule: TodaySession[] = [
  {
    id: 1,
    classId: 1,
    time: "08:00 - 10:00",
    class: "Toán 10A",
    teacher: "Nguyễn Thị Mai",
    room: "Phòng 101",
    students: 18,
    status: "completed",
  },
  {
    id: 2,
    classId: 2,
    time: "14:00 - 16:00",
    class: "Tiếng Anh B1",
    teacher: "Trần Văn Hùng",
    room: "Phòng A2",
    students: 15,
    status: "ongoing",
  },
  {
    id: 3,
    classId: 3,
    time: "17:00 - 19:00",
    class: "Hóa 11",
    teacher: "Lê Thị Hương",
    room: "Phòng Lab 1",
    students: 12,
    status: "upcoming",
  },
  {
    id: 4,
    classId: 1,
    time: "18:00 - 20:00",
    class: "Toán 12 Luyện Thi",
    teacher: "Nguyễn Thị Mai",
    room: "Phòng 201",
    students: 22,
    status: "upcoming",
  },
  {
    id: 5,
    classId: 4,
    time: "19:00 - 21:00",
    class: "Văn 12",
    teacher: "Phạm Minh Tuấn",
    room: "Phòng 102",
    students: 20,
    status: "upcoming",
  },
];

export const mockTodayAttendance: TodayAttendance = {
  total: 67,
  present: 58,
  absent: 6,
  late: 3,
};

export const mockAlerts: DashboardAlert[] = [
  {
    id: 1,
    type: "warning",
    message: "5 học viên vắng liên tiếp ≥ 3 buổi",
    action: "Xem danh sách",
    link: "/admin/attendance",
  },
  {
    id: 2,
    type: "info",
    message: "8 học viên chưa thanh toán học phí tháng này",
    action: "Xem danh sách",
    link: "/admin/tuition",
  },
  {
    id: 3,
    type: "warning",
    message: "3 lớp có tỉ lệ vắng cao (>20%)",
    action: "Xem báo cáo",
    link: "/admin/reports",
  },
];

export const mockOverdueStudents: OverdueStudent[] = [
  { studentId: 4, invoiceId: "INV_092024_004", name: "Phạm Thị Dung", class: "Văn 12", amount: "2.500.000đ", days: 12 },
  { studentId: 6, invoiceId: "INV_092024_006", name: "Vũ Thị Phương", class: "Toán 10A", amount: "2.000.000đ", days: 8 },
  { studentId: 7, invoiceId: "INV_092024_007", name: "Đặng Minh Khôi", class: "Hóa 11", amount: "1.800.000đ", days: 5 },
];
