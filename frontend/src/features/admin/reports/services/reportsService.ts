import { FinancialReport, AcademicReport } from "../types";
import {
  mockRevenueByMonth,
  mockRevenueBySubject,
  mockAttendanceByClass,
  mockStudentsBySubject,
  mockEnrollmentTrend,
  mockTuitionSummary,
} from "../data/mockData";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function randomDelay(min = 300, max = 700): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

export async function getFinancialReport(): Promise<FinancialReport> {
  await randomDelay();
  return {
    revenueByMonth: clone(mockRevenueByMonth),
    revenueBySubject: clone(mockRevenueBySubject),
    tuitionSummary: clone(mockTuitionSummary),
  };
}

export async function getAcademicReport(): Promise<AcademicReport> {
  await randomDelay();
  return {
    attendanceByClass: clone(mockAttendanceByClass),
    studentsBySubject: clone(mockStudentsBySubject),
    enrollmentTrend: clone(mockEnrollmentTrend),
  };
}
