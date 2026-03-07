import type { ClassInfo, ClassSession } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

import { MOCK_CLASSES, MOCK_SESSIONS } from "../data/mockData";

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get all classes the current user is enrolled in.
 * Includes ACTIVE and COMPLETED (closed) classes.
 * Phase 2: GET /api/user/classes
 */
export async function getMyClasses(): Promise<ClassInfo[]> {
    await randomDelay();
    return clone(MOCK_CLASSES);
}

/**
 * Get schedule sessions within a date range.
 * Phase 2: GET /api/user/schedule?startDate=&endDate=
 */
export async function getMySchedule(
    startDate?: string,
    endDate?: string
): Promise<ClassSession[]> {
    await randomDelay();
    let result = clone(MOCK_SESSIONS);

    if (startDate) {
        result = result.filter((s: ClassSession) => s.date >= startDate);
    }
    if (endDate) {
        result = result.filter((s: ClassSession) => s.date <= endDate);
    }

    return result.sort((a: ClassSession, b: ClassSession) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
}

/**
 * Get today's sessions for Dashboard.
 * Phase 2: GET /api/user/schedule/today
 */
export async function getTodaySessions(): Promise<ClassSession[]> {
    await randomDelay();
    const todayStr = new Date().toISOString().split("T")[0];
    return clone(MOCK_SESSIONS).filter((s: ClassSession) => s.date === todayStr);
}
