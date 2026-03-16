import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ClassOption {
  id: number;
  name: string;
}

/**
 * Fetch danh sách lớp từ backend để dùng cho filters/dropdowns.
 * Thay thế tất cả hardcoded CLASS_OPTIONS, TUITION_CLASS_LIST, ATTENDANCE_CLASS_LIST.
 */
export function useClassOptions() {
  return useQuery<ClassOption[]>({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/classes", { params: { limit: 200 } });
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return list.map((c: any) => ({ id: c.id, name: c.name || c.className }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}

export function useTeacherOptions() {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ["teachers", "options"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/teachers", { params: { limit: 200 } });
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return list.map((t: any) => ({ id: t.id, name: t.name || t.fullName }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacilityOptions() {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ["facilities", "options"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/facilities", { params: { limit: 200 } });
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return list.map((f: any) => ({ id: f.id, name: f.name }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch danh sách môn học từ backend.
 * Thay thế hardcoded SUBJECT_OPTIONS trong APP_CONFIG.
 */
export function useSubjectOptions() {
  return useQuery<string[]>({
    queryKey: ["subjects", "options"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/subjects", { params: { limit: 200 } });
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return list.map((s: any) => s.name || s.subjectName).filter(Boolean);
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Generate month options dynamically instead of hardcoded ["09/2024", "08/2024"]
 * Returns last 12 months in MM/YYYY format
 */
export function useMonthOptions(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    months.push(`${mm}/${yyyy}`);
  }
  return months;
}

/**
 * Fetch danh sách phòng theo cơ sở (facilityId).
 * Thay thế hardcoded ROOMS_BY_FACILITY.
 */
export function useRoomsByFacility(facilityId: number | string | undefined) {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ["rooms", "byFacility", facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      try {
        const { data } = await apiClient.get("/rooms", {
          params: { facilityId, limit: 200 },
        });
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return list.map((r: any) => ({ id: r.id, name: r.name || r.roomName }));
      } catch {
        return [];
      }
    },
    enabled: !!facilityId,
    staleTime: 5 * 60 * 1000,
  });
}
