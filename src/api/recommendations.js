import { request } from "./client.js";

export function getRecommendedNotes({ page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size });
  return request(`/recommendations/notes?${params}`);
}

export function sendRecommendationFeedback({ scene, targetType, targetId, action, detail = "" }) {
  return request("/recommendations/feedback", {
    method: "POST",
    body: JSON.stringify({ scene, targetType, targetId, action, detail }),
  });
}
