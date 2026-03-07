import {
  MonthlyRevenue,
  ChartSlice,
  ClassAttendance,
  EnrollmentData,
  TuitionSummary,
} from "../types";

export const mockRevenueByMonth: MonthlyRevenue[] = [
  { month: "T7", revenue: 68 },
  { month: "T8", revenue: 72 },
  { month: "T9", revenue: 65 },
  { month: "T10", revenue: 80 },
  { month: "T11", revenue: 88 },
  { month: "T12", revenue: 95 },
];

export const mockRevenueBySubject: ChartSlice[] = [
  { name: "Toán Học", value: 40, color: "hsl(var(--primary))" },
  { name: "Tiếng Anh", value: 30, color: "hsl(var(--secondary))" },
  { name: "Ngữ Văn", value: 15, color: "#8b5cf6" },
  { name: "Khoa học Tự nhiên", value: 10, color: "#f59e0b" },
  { name: "Khác", value: 5, color: "#6b7280" },
];

export const mockAttendanceByClass: ClassAttendance[] = [
  { class: "Toán 12 LT", rate: 94, students: 25, capacity: 25 },
  { class: "Anh Văn B1", rate: 91, students: 18, capacity: 20 },
  { class: "Toán 10A", rate: 89, students: 18, capacity: 25 },
  { class: "Hóa 11", rate: 85, students: 12, capacity: 20 },
  { class: "Văn 12", rate: 83, students: 20, capacity: 30 },
  { class: "Tiếng Anh SP", rate: 79, students: 14, capacity: 15 },
  { class: "Lý 10A", rate: 76, students: 9, capacity: 20 },
  { class: "Tin Học CB", rate: 72, students: 5, capacity: 15 },
];

export const mockStudentsBySubject: ChartSlice[] = [
  { name: "Toán", value: 320, color: "hsl(var(--primary))" },
  { name: "Tiếng Anh", value: 245, color: "hsl(var(--secondary))" },
  { name: "Văn", value: 180, color: "#8b5cf6" },
  { name: "Hóa Học", value: 142, color: "#f59e0b" },
  { name: "Vật Lý", value: 118, color: "#10b981" },
  { name: "Tin Học", value: 95, color: "#ec4899" },
  { name: "Khác", value: 134, color: "#6b7280" },
];

export const mockEnrollmentTrend: EnrollmentData[] = [
  { month: "T7", students: 198 },
  { month: "T8", students: 210 },
  { month: "T9", students: 205 },
  { month: "T10", students: 220 },
  { month: "T11", students: 232 },
  { month: "T12", students: 245 },
];

export const mockTuitionSummary: TuitionSummary = {
  collected: 85_000_000,
  pending: 12_500_000,
  overdue: 4_500_000,
  total: 102_000_000,
};
