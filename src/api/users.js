import { request } from "./client.js";

export function getMyProfile() {
  return request("/users/me/profile");
}

export function updateProfile({ nickname, avatarUrl, college, grade, bio }) {
  return request("/users/me/profile", {
    method: "PUT",
    body: JSON.stringify({ nickname, avatarUrl, college, grade, bio }),
  });
}

export function getRelations() {
  return request("/relations");
}

export function getUserProfile(userId) {
  return request(`/users/${userId}`);
}

export function searchUsers(keyword) {
  const params = new URLSearchParams({ keyword });
  return request(`/users/search?${params.toString()}`);
}

export function follow(userId) {
  return request(`/users/${userId}/follow`, { method: "POST" });
}

export function unfollow(userId) {
  return request(`/users/${userId}/follow`, { method: "DELETE" });
}

export function block(userId) {
  return request(`/users/${userId}/block`, { method: "POST" });
}

export function unblock(userId) {
  return request(`/users/${userId}/block`, { method: "DELETE" });
}

export function getBlockedUsers() {
  return request("/blocks");
}

export function report({ targetType, targetId, reason, description = "" }) {
  return request("/reports", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId, reason, description }),
  });
}
