export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface ClassAttendance {
  class: string;
  rate: number;
  students: number;
  capacity: number;
}

export interface EnrollmentData {
  month: string;
  students: number;
}

export interface TuitionSummary {
  collected: number;
  pending: number;
  overdue: number;
  total: number;
}

export interface FinancialReport {
  revenueByMonth: MonthlyRevenue[];
  revenueBySubject: ChartSlice[];
  tuitionSummary: TuitionSummary;
}

export interface AcademicReport {
  attendanceByClass: ClassAttendance[];
  studentsBySubject: ChartSlice[];
  enrollmentTrend: EnrollmentData[];
}

export const REPORT_MONTHS = [
  "Tháng 7/2024",
  "Tháng 8/2024",
  "Tháng 9/2024",
  "Tháng 10/2024",
  "Tháng 11/2024",
  "Tháng 12/2024",
] as const;
