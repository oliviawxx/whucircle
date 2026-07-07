import { request } from "./client.js";

// 笔记列表（主页/社交圈/我的/收藏）
export function getNotes({ scope = "PUBLIC", keyword, tag, page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ scope, page, size });
  if (keyword) params.set("keyword", keyword);
  if (tag) params.set("tag", tag);
  return request(`/notes?${params}`);
}

// 笔记详情
export function getNoteDetail(noteId) {
  return request(`/notes/${noteId}`);
}

// 发布笔记
export function createNote({ title, content, visibility, imageUrls = [], tags = [] }) {
  return request("/notes", {
    method: "POST",
    body: JSON.stringify({ title, content, visibility, imageUrls, tags }),
  });
}

// 删除笔记
export function deleteNote(noteId) {
  return request(`/notes/${noteId}`, { method: "DELETE" });
}

// 评论列表
export function getComments(noteId) {
  return request(`/notes/${noteId}/comments`);
}

// 发表评论
export function createComment(noteId, content) {
  return request(`/notes/${noteId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// 删除评论
export function deleteComment(noteId, commentId) {
  return request(`/notes/${noteId}/comments/${commentId}`, { method: "DELETE" });
}

// 点赞切换
export function likeNote(noteId) {
  return request(`/notes/${noteId}/like`, { method: "POST" });
}

// 收藏切换
export function saveNote(noteId) {
  return request(`/notes/${noteId}/save`, { method: "POST" });
}

// 标签列表
export function getTags() {
  return request("/tags");
}

// 社交圈
export function getSocialFeed({ keyword, tag, page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (keyword) params.set("keyword", keyword);
  if (tag) params.set("tag", tag);
  return request(`/feed/social?${params}`);
}
