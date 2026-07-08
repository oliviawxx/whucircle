import { request } from "./client.js";

export function getPrivacy() {
  return request("/settings/privacy");
}

export function updatePrivacy({
  noteVisibility,
  channelPermission,
  messagePermission,
  searchableByUsers,
  showEmailOnProfile,
  personalizedRecommendations,
  activityNotifications,
  loginAlerts,
}) {
  return request("/settings/privacy", {
    method: "PUT",
    body: JSON.stringify({
      defaultNoteVisibility: noteVisibility,
      defaultChannelJoinType: channelPermission,
      directMessagePermission: messagePermission,
      searchableByUsers,
      showEmailOnProfile,
      personalizedRecommendations,
      activityNotifications,
      loginAlerts,
    }),
  });
}
