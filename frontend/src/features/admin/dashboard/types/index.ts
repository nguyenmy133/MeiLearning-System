export interface DashboardStatData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface DailyRevenue {
  day: string;
  revenue: number;
}

export type SessionStatus = "completed" | "ongoing" | "upcoming";

export interface TodaySession {
  id: number;
  classId: number;   // FK → Class.id (dùng cho click-through tới trang lớp)
  time: string;
  class: string;
  teacher: string;
  room: string;
  students: number;
  status: SessionStatus;
}

export interface TodayAttendance {
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface DashboardAlert {
  id: number;        // Dùng để dismiss/navigate
  type: "warning" | "info";
  message: string;
  action: string;
  link?: string;     // Route đới tướng (VD: "/admin/tuition")
}

export interface OverdueStudent {
  studentId: number; // FK → Student.id
  invoiceId: string; // FK → TuitionInvoice.id
  name: string;
  class: string;
  amount: string;
  days: number;
}

export interface DashboardData {
  stats: DashboardStatData[];
  revenueData: DailyRevenue[];
  todaySchedule: TodaySession[];
  todayAttendance: TodayAttendance;
  alerts: DashboardAlert[];
  overdueStudents: OverdueStudent[];
}
