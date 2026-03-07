import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AddSessionDTO } from "../types";
import {
  getWeekSessions,
  getScheduleStats,
  getClassRefs,
  addSession,
  cancelSession,
} from "../services";

// ── Query key factory ─────────────────────────────────────────────────────────
export const scheduleKeys = {
  all: ["schedule"] as const,
  sessions: () => [...scheduleKeys.all, "sessions"] as const,
  sessionsByFacility: (facilityId?: string) =>
    [...scheduleKeys.sessions(), facilityId ?? "all"] as const,
  stats: () => [...scheduleKeys.all, "stats"] as const,
  classRefs: () => [...scheduleKeys.all, "classRefs"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useWeekSessions(facilityId?: string, teacherId?: number) {
  return useQuery({
    queryKey: [...scheduleKeys.sessionsByFacility(facilityId), teacherId ?? null],
    queryFn: () => getWeekSessions(facilityId, teacherId),
  });
}

export function useScheduleStats() {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: () => getScheduleStats(),
  });
}

export function useClassRefs() {
  return useQuery({
    queryKey: scheduleKeys.classRefs(),
    queryFn: () => getClassRefs(),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAddSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddSessionDTO) => addSession(dto),
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      const typeLabel = session.type === "makeup" ? "bù" : "thêm";
      toast.success(`Đã thêm buổi học ${typeLabel} cho lớp ${session.className}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Đã hủy buổi học");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
