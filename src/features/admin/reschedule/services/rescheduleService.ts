import { RescheduleRequest, RescheduleStats } from "../types";
import { mockRequests } from "../data/mockData";

// ─── In-memory DB ────────────────────────────────────────────────────────────

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function randomDelay(min = 300, max = 700): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

let db: RescheduleRequest[] = clone(mockRequests);

// ─── Service functions ────────────────────────────────────────────────────────

export async function getRequests(): Promise<RescheduleRequest[]> {
  await randomDelay();
  return clone(db);
}

export async function getStats(): Promise<RescheduleStats> {
  await randomDelay(200, 400);
  const data = clone(db);
  return {
    total: data.length,
    pending: data.filter((r) => r.status === "pending").length,
    approved: data.filter((r) => r.status === "approved").length,
    rejected: data.filter((r) => r.status === "rejected").length,
  };
}

export async function approveRequest(id: string): Promise<RescheduleRequest> {
  await randomDelay();
  const req = db.find((r) => r.id === id);
  if (!req) throw new Error("Không tìm thấy yêu cầu");
  if (req.status !== "pending")
    throw new Error("Yêu cầu không ở trạng thái chờ duyệt");
  req.status = "approved";
  req.reviewedAt = new Date().toLocaleDateString("vi-VN");
  req.reviewedBy = "Admin";
  return clone(req);
}

export async function rejectRequest(
  id: string,
  reason: string
): Promise<void> {
  await randomDelay();
  const req = db.find((r) => r.id === id);
  if (!req) throw new Error("Không tìm thấy yêu cầu");
  if (req.status !== "pending")
    throw new Error("Yêu cầu không ở trạng thái chờ duyệt");
  if (!reason.trim()) throw new Error("Vui lòng nhập lý do từ chối");
  req.status = "rejected";
  req.reviewedAt = new Date().toLocaleDateString("vi-VN");
  req.rejectReason = reason.trim();
}
