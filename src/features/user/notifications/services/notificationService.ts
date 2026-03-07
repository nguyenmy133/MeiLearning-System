import { MOCK_NOTIFICATIONS } from "../data/mockData";
import type { NotificationItem } from "../types";

export const notificationService = {
    getNotifications: async (): Promise<NotificationItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...MOCK_NOTIFICATIONS]);
            }, 500);
        });
    },
};
