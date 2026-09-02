import { Mongo } from "meteor/mongo";

import { EventEntity, Events } from "/imports/api/events/events";
import { isEventVenueRef } from "./lib/isEventVenueRef";
import { VenueModel, Venues } from "/imports/api/venues/venues";

/**
 * Update the venue field for all events matching the selector
 */
export async function updateVenue(eventIdOrSelector: string | Mongo.Selector<EventEntity>) {
  for (const event of await Events.find(eventIdOrSelector).fetchAsync()) {
    let venue: VenueModel | undefined;
    if (isEventVenueRef(event.venue)) {
      venue = await Venues.findOneAsync(event.venue._id);
    }

    let update: Mongo.Modifier<EventEntity>;
    if (venue) {
      if (event.start < new Date()) {
        // Do not update venue for historical events
        continue;
      }

      // Sync values to the values set in the venue document
      update = {
        $set: {
          "venue.name": venue.name,
          "venue.address": venue.address,
          "venue.loc": venue.loc,
          "venue.level": venue.level,
          "venue.editor": venue.editor,
          "venue.restrictedUse": venue.restrictedUse,
        },
      };
    } else {
      // If the venue vanished from the DB we delete the reference but let the cached fields
      // live on
      update = { $unset: { "venue._id": 1 } };
    }

    await Events.updateAsync({ _id: event._id }, update);
  }
}
