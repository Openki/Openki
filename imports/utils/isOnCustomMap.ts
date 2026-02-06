export function isOnCustomMap(venue: { level?: number }) {
  return venue.level !== undefined;
}
