import { Mongo } from "meteor/mongo";
// eslint-disable-next-line import/no-extraneous-dependencies
import { UpdateFilter } from "mongodb";

import { EventEntity, Events } from "/imports/api/events/events";
import { VenueModel, Venues } from "/imports/api/venues/venues";

/**
 * Update the venue field for all events matching the selector
 */
export async function updateVenue(eventIdOrSelector: string | Mongo.Selector<EventEntity>) {
  for (const event of await Events.find(eventIdOrSelector).fetchAsync()) {
    let venue: VenueModel | undefined;
    if (event.venue?._id) {
      venue = Venues.findOne(event.venue._id);
    }

    let update: UpdateFilter<EventEntity>;
    if (venue) {
      if (event.start < new Date()) {
        // Do not update venue for historical events
        break;
      }

      // Sync values to the values set in the venue document
      update = {
        $set: {
          "venue.name": venue.name,
          "venue.address": venue.address,
          "venue.loc": venue.loc,
          "venue.editor": venue.editor,
        },
      } as UpdateFilter<EventEntity>;
    } else {
      // If the venue vanished from the DB we delete the reference but let the cached fields
      // live on
      update = { $unset: { "venue._id": 1 } };
    }

    Events.update({ _id: event._id }, update);
  }
}
