import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { NotificationItem } from "../types";

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return data;
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};

// Named function exports
export const getNotifications = notificationService.getNotifications;
export const markNotificationRead = notificationService.markRead;
export const markAllRead = notificationService.markAllRead;
