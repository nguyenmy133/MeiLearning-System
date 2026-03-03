import type {
  LeaveRequest,
  LeaveStats,
  CreateLeaveDTO,
  LeaveQueryParams,
  LeaveStatus,
} from "../types";
import { mockLeaveRequests } from "../data/mockData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomDelay = () =>
  new Promise<void>((res) => setTimeout(res, 300 + Math.random() * 400));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// ── In-memory DB ──────────────────────────────────────────────────────────────
let db: LeaveRequest[] = clone(mockLeaveRequests);
let nextId = db.length + 1;

// ── Service ───────────────────────────────────────────────────────────────────

/** [GET] /api/leave — có thể lọc theo role / requesterId / classId / status */
export async function getLeaveRequests(
  params?: LeaveQueryParams
): Promise<LeaveRequest[]> {
  await randomDelay();
  let result = clone(db);

  if (params?.requesterId !== undefined) {
    result = result.filter((r) => r.requesterId === params.requesterId);
  }
  if (params?.requesterRole) {
    result = result.filter((r) => r.requesterRole === params.requesterRole);
  }
  if (params?.classId) {
    result = result.filter((r) => r.classId === params.classId);
  }
  if (params?.status) {
    result = result.filter((r) => r.status === params.status);
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** [GET] /api/leave/stats */
export async function getLeaveStats(
  params?: Pick<LeaveQueryParams, "requesterRole" | "requesterId">
): Promise<LeaveStats> {
  await randomDelay();
  let data = clone(db);

  if (params?.requesterId !== undefined) {
    data = data.filter((r) => r.requesterId === params.requesterId);
  }
  if (params?.requesterRole) {
    data = data.filter((r) => r.requesterRole === params.requesterRole);
  }

  return {
    total: data.length,
    pending: data.filter((r) => r.status === "pending").length,
    approved: data.filter((r) => r.status === "approved").length,
    rejected: data.filter((r) => r.status === "rejected").length,
  };
}

/** [POST] /api/leave — Gửi đơn xin nghỉ */
export async function createLeaveRequest(
  dto: CreateLeaveDTO
): Promise<LeaveRequest> {
  await randomDelay();
  if (!dto.reason.trim()) throw new Error("Vui lòng nhập lý do xin nghỉ");
  if (!dto.leaveDate) throw new Error("Vui lòng chọn ngày xin nghỉ");

  const now = new Date().toISOString();
  const item: LeaveRequest = {
    id: `LV-${String(nextId++).padStart(3, "0")}`,
    ...dto,
    status: "pending",
    createdAt: now,
    reviewedBy: null,
  };
  db.push(item);
  return clone(item);
}

/** [PATCH] /api/leave/:id/approve — Admin / Giáo viên duyệt */
export async function approveLeaveRequest(
  id: string,
  reviewedBy: string
): Promise<LeaveRequest> {
  await randomDelay();
  const idx = db.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Không tìm thấy đơn xin nghỉ");
  if (db[idx].status !== "pending")
    throw new Error("Đơn không ở trạng thái chờ duyệt");

  db[idx] = {
    ...db[idx],
    status: "approved",
    reviewedAt: new Date().toLocaleDateString("vi-VN"),
    reviewedBy,
  };
  return clone(db[idx]);
}

/** [PATCH] /api/leave/:id/reject — Admin / Giáo viên từ chối */
export async function rejectLeaveRequest(
  id: string,
  reviewedBy: string,
  rejectReason: string
): Promise<LeaveRequest> {
  await randomDelay();
  if (!rejectReason.trim()) throw new Error("Vui lòng nhập lý do từ chối");
  const idx = db.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Không tìm thấy đơn xin nghỉ");
  if (db[idx].status !== "pending")
    throw new Error("Đơn không ở trạng thái chờ duyệt");

  db[idx] = {
    ...db[idx],
    status: "rejected",
    reviewedAt: new Date().toLocaleDateString("vi-VN"),
    reviewedBy,
    rejectReason: rejectReason.trim(),
  };
  return clone(db[idx]);
}

/** Reset in-memory DB (dev utility) */
export function resetLeaveData(): void {
  db = clone(mockLeaveRequests);
  nextId = db.length + 1;
}
