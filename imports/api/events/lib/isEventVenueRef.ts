import { EventEntity, EventVenueRef } from "/imports/api/events/events";

export function isEventVenueRef(venue: EventEntity["venue"]): venue is EventVenueRef {
  return Boolean(venue && "_id" in venue && venue._id);
}
