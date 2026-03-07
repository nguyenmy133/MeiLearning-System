import { MOCK_PENDING_TASKS, MOCK_ATTENDANCE_RATE } from "../data/mockData";
import type { PendingTask } from "../types";

export const dashboardService = {
    getPendingTasks: async (): Promise<PendingTask[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_PENDING_TASKS);
            }, 500);
        });
    },

    getAttendanceRate: async (): Promise<number> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_ATTENDANCE_RATE);
            }, 500);
        });
    },
};
