import { EventParticipant } from "/imports/api/events/events";

/** Returns the total number of participants. Also includes the number of companions. */
export function numberOf(participants: EventParticipant[] = []) {
  return participants.map((p) => 1 + (p.companions || 0)).reduce((a, b) => a + b, 0);
}
