import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { NotificationItem } from "../types";

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const { data } = await apiClient.get(API.NOTIFICATIONS.LIST);
    return data;
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_ALL_READ);
  },
};

// Named function exports
export const getNotifications = notificationService.getNotifications;
export const markNotificationRead = notificationService.markRead;
export const markAllRead = notificationService.markAllRead;
