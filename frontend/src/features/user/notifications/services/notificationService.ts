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
    // Used by bell-icon / SSE hooks — fetches recent 100 without pagination UI
    const { data: pageResp } = await apiClient.get(
      API.NOTIFICATIONS.LIST,
      { params: { page: 1, limit: 100 } }
    );
    const items = (pageResp as PageResponse<NotificationItem>)?.data;
    return Array.isArray(items) ? items : [];
  },

  async getPaginated(
    params: { page: number; limit: number; filter?: string }
  ): Promise<PageResponse<NotificationItem>> {
    const { data: pageResp } = await apiClient.get(API.NOTIFICATIONS.LIST, {
      params: { page: params.page, limit: params.limit },
    });
    const resp = pageResp as PageResponse<NotificationItem>;
    return {
      data: Array.isArray(resp?.data) ? resp.data : [],
      total: resp?.total ?? 0,
      page: resp?.page ?? params.page,
      limit: resp?.limit ?? params.limit,
      totalPages: resp?.totalPages ?? 1,
    };
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch(API.NOTIFICATIONS.MARK_ALL_READ);
  },

  async deleteAllRead(): Promise<{ deleted: number }> {
    const { data } = await apiClient.delete(API.NOTIFICATIONS.DELETE_READ);
    return data as { deleted: number };
  },

  async deleteByIds(ids: number[]): Promise<{ deleted: number }> {
    const { data } = await apiClient.delete(API.NOTIFICATIONS.BATCH_DELETE, {
      data: { ids },
    });
    return data as { deleted: number };
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
