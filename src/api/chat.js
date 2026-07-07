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
