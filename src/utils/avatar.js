export const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23ffffff'/%3E%3C/svg%3E";

export function avatarUrl(value) {
  return typeof value === "string" && value.trim() ? value : DEFAULT_AVATAR;
}
