import { request } from "./client.js";

export function getConversations() {
  return request("/conversations");
}

export function getMessages(conversationId, { page = 1, size = 50 } = {}) {
  return request(`/conversations/${conversationId}/messages?page=${page}&size=${size}`);
}

export function sendMessage(conversationId, content) {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function markRead(conversationId) {
  return request(`/conversations/${conversationId}/read`, { method: "PUT" });
}

export function createConversation({ type, participantIds, name }) {
  return request("/conversations", {
    method: "POST",
    body: JSON.stringify({ type, participantIds, name }),
  });
}

export function getGroupDetail(conversationId) { return request(`/conversations/${conversationId}/group`); }
export function renameGroup(conversationId, name) { return request(`/conversations/${conversationId}/group/name`, { method: "PUT", body: JSON.stringify({ name }) }); }
export function removeGroupMember(conversationId, userId) { return request(`/conversations/${conversationId}/group/members/${userId}`, { method: "DELETE" }); }
export function leaveGroup(conversationId) { return request(`/conversations/${conversationId}/group/members/me`, { method: "DELETE" }); }
export function transferGroupOwner(conversationId, userId) { return request(`/conversations/${conversationId}/group/owner`, { method: "PUT", body: JSON.stringify({ userId }) }); }
export function dissolveGroup(conversationId) { return request(`/conversations/${conversationId}/group`, { method: "DELETE" }); }
