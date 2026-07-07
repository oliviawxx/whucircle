import { request } from "./client.js";

export function getNotifications({ page = 1, size = 20 } = {}) {
  return request(`/notifications?page=${page}&size=${size}`);
}

export function getUnreadNotificationCount() {
  return request("/notifications/count");
}

export function markNotificationRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return request("/notifications/read-all", { method: "PUT" });
}
