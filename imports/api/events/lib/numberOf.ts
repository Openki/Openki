import { EventParticipant } from "/imports/api/events/events";

export function numberOf(participants: EventParticipant[] | undefined) {
  return participants?.map((p) => (p.companions || 0) + 1).reduce((a, b) => a + b, 0) || 0;
}
