import { request } from "./client.js";

export function getChannels({ joined, keyword, page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (joined != null) params.set("joined", joined);
  if (keyword) params.set("keyword", keyword);
  return request(`/channels?${params}`);
}

export function getChannel(channelId) {
  return request(`/channels/${channelId}`);
}

export function getManagedChannels({ page = 1, size = 20 } = {}) {
  return request(`/channels/managed?page=${page}&size=${size}`);
}

export function getInitialAdminDashboard(channelId) {
  return request(`/channels/${channelId}/initial-admin`);
}

export function applyForChannelAdmin(channelId) {
  return request(`/channels/${channelId}/admin-applications`, {
    method: "POST",
  });
}

export function inviteChannelAdmin(channelId, userId) {
  return request(`/channels/${channelId}/admin-invitations`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function handleChannelAdminRequest(requestId, action) {
  return request(`/channel-admin-requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  });
}

export function createChannel({ name, joinType, password, announcement }) {
  return request("/channels", {
    method: "POST",
    body: JSON.stringify({ name, joinType, password, announcement }),
  });
}

export function updateAnnouncement(channelId, announcement) {
  return request(`/channels/${channelId}/announcement`, {
    method: "PUT",
    body: JSON.stringify({ announcement }),
  });
}

export function joinChannel(channelId, password) {
  return request(`/channels/${channelId}/join`, {
    method: "POST",
    body: password ? JSON.stringify({ password }) : undefined,
  });
}

export function getPosts(channelId, { page = 1, size = 20 } = {}) {
  return request(`/channels/${channelId}/posts?page=${page}&size=${size}`);
}

export function createPost(channelId, { title, content, pinned }) {
  return request(`/channels/${channelId}/posts`, {
    method: "POST",
    body: JSON.stringify({ title, content, pinned }),
  });
}

export function getPostDetail(postId) {
  return request(`/channel-posts/${postId}`);
}

export function replyToPost(postId, content) {
  return request(`/channel-posts/${postId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function likePost(postId) {
  return request(`/channel-posts/${postId}/like`, { method: "POST" });
}

export function setPostPinned(postId, pinned) {
  return request(`/channel-posts/${postId}/pin`, {
    method: "PUT",
    body: JSON.stringify({ pinned }),
  });
}
