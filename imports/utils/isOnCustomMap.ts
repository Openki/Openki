import { Geodata } from "../api/Geodata";

export function isOnCustomMap(venue: { loc?: Geodata; level?: number }) {
  return venue.level !== undefined;
}
