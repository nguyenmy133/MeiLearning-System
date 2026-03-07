import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/features/shared/auth/authService";
import type { SaveAttendanceDTO, AttendanceQueryParams } from "../types";
import {
    getTeacherSessions,
    getSessionAttendance,
    saveAttendance,
    getAttendanceStats,
} from "../services";

const teacherId = () => authService.getCurrentTeacherId();

// ── Query key factory ─────────────────────────────────────────────────────────
export const attendanceKeys = {
    all: ["teacher-attendance"] as const,
    sessions: (params?: AttendanceQueryParams) =>
        [...attendanceKeys.all, "sessions", params] as const,
    session: (sessionId: number) => [...attendanceKeys.all, "session", sessionId] as const,
    stats: (sessionId: number) => [...attendanceKeys.all, "stats", sessionId] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTeacherSessions(params?: AttendanceQueryParams) {
    return useQuery({
        queryKey: attendanceKeys.sessions(params),
        queryFn: () => getTeacherSessions(teacherId(), params),
    });
}

export function useSessionAttendance(sessionId: number) {
    return useQuery({
        queryKey: attendanceKeys.session(sessionId),
        queryFn: () => getSessionAttendance(sessionId, teacherId()),
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
        mutationFn: (dto: SaveAttendanceDTO) => saveAttendance(teacherId(), dto),
        onSuccess: (data, dto) => {
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
