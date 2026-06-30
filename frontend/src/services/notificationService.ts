import { apiClient } from "../lib/api";
import type { NotificationApi, UnreadCountResponse } from "../types/api";

export async function getNotifications(): Promise<NotificationApi[]> {
  const response = await apiClient.get<NotificationApi[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationApi> {
  const response = await apiClient.patch<NotificationApi>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<UnreadCountResponse>(
    "/notifications/unread/count",
  );
  return response.data.unread_count;
}

export async function markAllNotificationsRead(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) => markNotificationRead(id)),
  );
}
