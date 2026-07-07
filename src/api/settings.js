import { request } from "./client.js";

export function getPrivacy() {
  return request("/settings/privacy");
}

export function updatePrivacy({ noteVisibility, channelPermission, messagePermission }) {
  return request("/settings/privacy", {
    method: "PUT",
    body: JSON.stringify({
      defaultNoteVisibility: noteVisibility,
      defaultChannelJoinType: channelPermission,
      directMessagePermission: messagePermission,
    }),
  });
}
