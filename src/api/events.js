import { request } from "./client.js";

export function getChannelEvents(channelId, { status, joined, page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (status) params.set("status", status);
  if (joined != null) params.set("joined", joined);
  return request(`/channels/${channelId}/events?${params}`);
}

export function createChannelEvent(channelId, payload) {
  return request(`/channels/${channelId}/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getChannelEvent(eventId) {
  return request(`/channel-events/${eventId}`);
}

export function updateChannelEvent(eventId, payload) {
  return request(`/channel-events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function cancelChannelEvent(eventId) {
  return request(`/channel-events/${eventId}`, { method: "DELETE" });
}

export function joinChannelEvent(eventId) {
  return request(`/channel-events/${eventId}/join`, { method: "POST" });
}

export function leaveChannelEvent(eventId) {
  return request(`/channel-events/${eventId}/join`, { method: "DELETE" });
}

export function getChannelEventParticipants(eventId, { page = 1, size = 50 } = {}) {
  return request(`/channel-events/${eventId}/participants?page=${page}&size=${size}`);
}

export function getCalendarEvents({ from, to, status } = {}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (status) params.set("status", status);
  const query = params.toString();
  return request(`/calendar/events${query ? `?${query}` : ""}`);
}
