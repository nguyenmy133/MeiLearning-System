import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SaveAttendanceDTO, AttendanceQueryParams } from "../types";
import {
    getMyTeacherSessions,
    getSessionAttendance,
    saveAttendance,
    getAttendanceStats,
} from "../services";

// ── Query key factory ─────────────────────────────────────────────────────────
export const attendanceKeys = {
    all: ["teacher-attendance"] as const,
    sessions: (date?: string) =>
        [...attendanceKeys.all, "sessions", date ?? "today"] as const,
    session: (sessionId: number) => [...attendanceKeys.all, "session", sessionId] as const,
    stats: (sessionId: number) => [...attendanceKeys.all, "stats", sessionId] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách buổi dạy của teacher đang đăng nhập.
 * Không cần teacherId — backend resolve từ JWT.
 */
export function useTeacherSessions(date?: string, params?: AttendanceQueryParams) {
    return useQuery({
        queryKey: attendanceKeys.sessions(date),
        queryFn: () => getMyTeacherSessions(date, params),
    });
}

export function useSessionAttendance(sessionId: number) {
    return useQuery({
        queryKey: attendanceKeys.session(sessionId),
        queryFn: () => getSessionAttendance(sessionId),
        enabled: sessionId > 0,
    });
}

export function useAttendanceStats(sessionId: number) {
    return useQuery({
        queryKey: attendanceKeys.stats(sessionId),
        queryFn: () => getAttendanceStats(sessionId),
        enabled: sessionId > 0,
    });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSaveAttendance() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: SaveAttendanceDTO) => saveAttendance(0, dto),
        onSuccess: (_data, dto) => {
            qc.invalidateQueries({ queryKey: attendanceKeys.session(dto.sessionId) });
            qc.invalidateQueries({ queryKey: attendanceKeys.stats(dto.sessionId) });
            qc.invalidateQueries({ queryKey: attendanceKeys.sessions() });
            toast.success(
                dto.confirm
                    ? "Đã chốt điểm danh buổi học thành công!"
                    : "Đã lưu điểm danh (nháp)."
            );
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
