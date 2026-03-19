import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { NotificationItem } from "../types";

export interface SendNotificationPayload {
  userId?: number | null;
  role?: string | null;
  title: string;
  content: string;
  severity?: string;
}

interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    // Backend: ApiResponse { data: PageResponse { data: [...], total, page, limit, totalPages }, message }
    // Interceptor unwraps ApiResponse → we get { data: PageResponse, message }
    // Destructuring { data } → pageResp = PageResponse
    const { data: pageResp } = await apiClient.get(
      API.NOTIFICATIONS.LIST,
      { params: { page: 1, limit: 100 } }
    );
    // pageResp is PageResponse — extract the notification array
    const items = (pageResp as PageResponse<NotificationItem>)?.data;
    return Array.isArray(items) ? items : [];
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_ALL_READ);
  },

  async sendNotification(payload: SendNotificationPayload): Promise<void> {
    await apiClient.post(API.NOTIFICATIONS.SEND, payload);
  },
};

// Named function exports
export const getNotifications = notificationService.getNotifications;
export const markNotificationRead = notificationService.markRead;
export const markAllRead = notificationService.markAllRead;
export const sendNotification = notificationService.sendNotification;
