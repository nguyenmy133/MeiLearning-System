import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AttendanceQueryParams, AttendanceRecordStatus, QrActivatedBy } from "../types";
import {
  getAttendanceSessions,
  getAttendanceStats,
  getLiveSessions,
  getAbsentAlerts,
  toggleQR,
  getSessionRecords,
  updateAttendanceRecord,
} from "../services";

// ── Query key factory ─────────────────────────────────────────────────────────
export const attendanceKeys = {
  all: ["attendance"] as const,
  sessions: () => [...attendanceKeys.all, "sessions"] as const,
  sessionList: (params?: AttendanceQueryParams) =>
    [...attendanceKeys.sessions(), params] as const,
  stats: () => [...attendanceKeys.all, "stats"] as const,
  live: () => [...attendanceKeys.all, "live"] as const,
  alerts: () => [...attendanceKeys.all, "alerts"] as const,
  records: (sessionId: number) =>
    [...attendanceKeys.all, "records", sessionId] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAttendanceSessions(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: attendanceKeys.sessionList(params),
    queryFn: () => getAttendanceSessions(params),
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: attendanceKeys.stats(),
    queryFn: () => getAttendanceStats(),
  });
}

export function useLiveSessions() {
  return useQuery({
    queryKey: attendanceKeys.live(),
    queryFn: () => getLiveSessions(),
    refetchInterval: 10_000, // Poll every 10s để cập nhật QR status real-time
  });
}

export function useAbsentAlerts() {
  return useQuery({
    queryKey: attendanceKeys.alerts(),
    queryFn: () => getAbsentAlerts(),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useToggleQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, activatedBy }: { sessionId: number; activatedBy?: QrActivatedBy }) =>
      toggleQR(sessionId, activatedBy ?? "admin"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.live() });
      toast.success("Đã tạo mã QR cho buổi học");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ── Session records ───────────────────────────────────────────────────────────

/**
 * Danh sách điểm danh từng học viên trong một buổi học
 * [GET] /api/attendance/sessions/:id/records
 */
export function useSessionRecords(sessionId: number) {
  return useQuery({
    queryKey: attendanceKeys.records(sessionId),
    queryFn: () => getSessionRecords(sessionId),
    enabled: sessionId > 0,
  });
}

/**
 * Sửa trạng thái điểm danh thủ công (Admin override)
 * [PATCH] /api/attendance/records/:id
 */
export function useUpdateAttendanceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recordId,
      status,
      note,
      sessionId,
    }: {
      recordId: number;
      status: AttendanceRecordStatus;
      note?: string;
      sessionId: number;
    }) => updateAttendanceRecord(recordId, status, note),
    onSuccess: (_record, variables) => {
      qc.invalidateQueries({ queryKey: attendanceKeys.records(variables.sessionId) });
      qc.invalidateQueries({ queryKey: attendanceKeys.sessions() });
      toast.success("Đã cập nhật điểm danh");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
