import { request } from "./client.js";

export function getAdminDashboard() {
  return request("/admin/dashboard");
}

export function setAdminUserStatus(userId, status) {
  return request(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function setAdminChannelStatus(channelId, status) {
  return request(`/admin/channels/${channelId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminNote(noteId) {
  return request(`/admin/notes/${noteId}`, { method: "DELETE" });
}

export function deleteAdminChannelPost(postId) {
  return request(`/admin/channel-posts/${postId}`, { method: "DELETE" });
}
