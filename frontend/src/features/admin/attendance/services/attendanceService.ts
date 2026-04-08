import { apiClient } from "@/lib/api-client";

// ── Types (inline) ────────────────────────────────────────────────────────────

interface SessionRow {
  id: number;
  classId: number;
  className: string;
  teacherName: string;
  roomName: string | null;
  facilityName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

export interface AttendanceActivityLogResponse {
  id: number;
  timestamp: string;
  studentName: string;
  className: string;
  status: string; // late, absent, absent_excused
  updatedBy: string;
}

// ── Existing records by session ───────────────────────────────────────────────

export async function getAttendanceBySession(sessionId: number) {
  const { data } = await apiClient.get("/attendance", { params: { sessionId } });
  return data;
}

export async function bulkAttendance(
  sessionId: number,
  attendances: Array<{ studentId: number; status: string; note?: string }>
) {
  const { data } = await apiClient.post("/attendance/bulk", { sessionId, attendances });
  return data;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getAttendanceStats(params?: { classId?: number; month?: string }) {
  try {
    const { data } = await apiClient.get("/attendance/stats", { params });
    return {
      todayPresent: data?.todayPresentCount ?? 0,
      averageRate: data?.attendanceRate != null ? Math.round(data.attendanceRate) : 0,
      totalLate: data?.lateCount ?? 0,
      alertCount: data?.absentCount ?? 0,
      totalRecords: data?.totalSessions ?? 0,
      totalPresent: data?.presentCount ?? 0,
      totalAbsent: data?.absentCount ?? 0,
    };
  } catch {
    return {
      todayPresent: 0,
      averageRate: 0,
      totalLate: 0,
      alertCount: 0,
      totalRecords: 0,
      totalPresent: 0,
      totalAbsent: 0,
    };
  }
}

// ── Admin: All sessions (with filters) ────────────────────────────────────────

export async function getAttendanceSessions(params?: any) {
  try {
    const { data } = await apiClient.get("/attendance/sessions/all", { params });
    
    // Check if it's already a PaginatedResponse
    const isPaginated = data && typeof data === "object" && "data" in data && Array.isArray(data.data);
    const rawSessions = isPaginated ? data.data : (Array.isArray(data) ? data : []);
    
    const mappedSessions = rawSessions.map((s: SessionRow) => ({
      id: s.id,
      classId: s.classId,
      className: s.className ?? "",
      teacherName: s.teacherName ?? "",
      facilityId: "",
      facilityName: s.facilityName ?? "",
      room: s.roomName ?? "",
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      total: s.totalStudents ?? 0,
      present: s.presentCount ?? 0,
      absent: s.absentCount ?? 0,
      late: 0,
      rate: s.totalStudents > 0
        ? Math.round((s.presentCount / s.totalStudents) * 100)
        : 0,
      status: s.status ?? "upcoming",
      createdAt: "",
      updatedAt: "",
    }));

    if (isPaginated) {
      return {
        ...data,
        data: mappedSessions
      };
    }

    return {
      data: mappedSessions,
      total: mappedSessions.length,
      page: 1,
      limit: mappedSessions.length || 10,
      totalPages: 1
    };
  } catch {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  }
}

// ── Admin: Live sessions (today, status=upcoming = ongoing) ───────────────────

export async function getLiveSessions() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await apiClient.get("/attendance/sessions/all", {
      params: { date: today },
    });
    if (!Array.isArray(data)) return [];

    // Filter: sessions that are "upcoming" AND chronologically haven't completely ended (allow 30m buffer)
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const liveSessions = data.filter((s: any) => {
      if (s.status !== "upcoming") return false;
      if (!s.endTime) return true;
      
      const [endH, endM] = s.endTime.split(":").map(Number);
      const endMin = endH * 60 + endM;
      
      // Cho phép hiển thị ở "Đang diễn ra" thêm tối đa 30 phút sau khi kết thúc 
      // Phòng trường hợp Giáo viên điểm danh trễ hoặc học quá giờ
      return nowMin <= endMin + 30;
    });

    // Check QR status for each live session
    const results = await Promise.all(
      liveSessions.map(async (s: SessionRow) => {
        let qrActive = false;
        let qrToken = "";
        let qrExpiresAt = "";
        try {
          // apiClient interceptor unwraps response.data → { data: T, message }
          // destructure data field from ApiResponse wrapper
          const { data: qrData } = await apiClient.get("/attendance/qr/active", {
            params: { sessionId: s.id },
          }) as any;
          if (qrData?.token) {
            const remaining = new Date(qrData.expiresAt).getTime() - Date.now();
            if (remaining > 0) {
              qrActive = true;
              qrToken = qrData.token;
              qrExpiresAt = qrData.expiresAt;
            }
          }
        } catch { /* no active QR or 204 */ }

        return {
          id: s.id,
          classId: s.classId,
          className: s.className ?? "",
          teacherName: s.teacherName ?? "",
          teacherId: 0,
          facilityId: "",
          facilityName: s.facilityName ?? "",
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.roomName ?? "",
          total: s.totalStudents ?? 0,
          checkedIn: s.presentCount ?? 0,
          qrActive,
          qrToken,
          qrExpiresAt,
          activeBy: null,
        };
      })
    );
    return results;
  } catch {
    return [];
  }
}

// ── Live Attendance Activity Feed ─────────────────────────────────────────────

export async function getAbsentAlerts(): Promise<AttendanceActivityLogResponse[]> {
  try {
    const { data } = await apiClient.get("/attendance/alerts");
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

// ── Toggle QR (admin can generate QR for any session) ─────────────────────────

export async function toggleQR(sessionId: number, _activatedBy: string) {
  // Admin generates a QR token (same as teacher)
  const { data } = await apiClient.post("/attendance/qr/generate", null, {
    params: { sessionId },
  });
  return {
    token: data.token,
    expiresAt: data.expiresAt,
    expiryMinutes: data.expiryMinutes,
    sessionId: data.sessionId,
    qrActive: true,
    className: "",
  };
}

// ── Session records (roster) ──────────────────────────────────────────────────

export async function getSessionRecords(sessionId: number) {
  try {
    const { data } = await apiClient.get("/attendance/roster", {
      params: { sessionId },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ── Update single attendance record ───────────────────────────────────────────

export async function updateAttendanceRecord(
  recordId: number,
  status: string,
  note?: string
) {
  const { data } = await apiClient.patch(`/attendance/records/${recordId}`, {
    status,
    note,
  });
  return data;
}

// ── QR check-in (admin override) ──────────────────────────────────────────────

export async function qrCheckIn(sessionId: number, studentId: number) {
  const { data } = await apiClient.post("/attendance/check-in", null, {
    params: { sessionId, studentId },
  });
  return data;
}

// ── Export Excel ───────────────────────────────────────────────────────────────

export async function exportAttendanceExcel(classId?: number, month?: string) {
  const blob = await apiClient.get("/attendance/export/excel", {
    params: { classId, month },
    responseType: "blob",
  });
  return blob as unknown as Blob;
}
