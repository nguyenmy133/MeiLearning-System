import type { RescheduleRequest, CreateRescheduleDTO, RescheduleQueryParams } from "../types";
import { mockRescheduleRequests } from "../data/mockData";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let db: RescheduleRequest[] = clone(mockRescheduleRequests);
let nextSeq = db.length + 1;

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Get reschedule requests for a teacher.
 * Phase 2: GET /api/teacher/reschedule-requests?status=&classId=
 */
export async function getRescheduleRequests(
    teacherId: number,
    params?: RescheduleQueryParams
): Promise<RescheduleRequest[]> {
    await randomDelay();
    let result = clone(db).filter((r: RescheduleRequest) => r.teacherId === teacherId);

    if (params?.status && params.status !== "all") {
        result = result.filter((r: RescheduleRequest) => r.status === params.status);
    }
    if (params?.classId) {
        result = result.filter((r: RescheduleRequest) => r.classId === params.classId);
    }
    return result;
}

/**
 * Submit a new reschedule/makeup request.
 * Phase 2: POST /api/teacher/reschedule-requests
 */
export async function createRescheduleRequest(
    teacherId: number,
    dto: CreateRescheduleDTO
): Promise<RescheduleRequest> {
    await randomDelay();

    if (!dto.reason.trim()) throw new Error("Vui lòng nhập lý do.");
    if (!dto.requestedDate.trim()) throw new Error("Vui lòng chọn ngày mới.");

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const seq = String(nextSeq++).padStart(3, "0");

    const request: RescheduleRequest = {
        id: `RS-${year}${month}-${seq}`,
        teacherId,
        ...dto,
        className: "", // populated by join in real BE
        status: "pending",
        createdAt: now.toLocaleDateString("vi-VN"),
    };
    db.push(request);
    return clone(request);
}

export function resetRescheduleData(): void {
    db = clone(mockRescheduleRequests);
    nextSeq = db.length + 1;
}
