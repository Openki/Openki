import { Meteor } from "meteor/meteor";
// eslint-disable-next-line import/no-extraneous-dependencies
import { UpdateFilter } from "mongodb";
import { _ } from "meteor/underscore";

import { EventEntity, Events } from "/imports/api/events/events";
import { VenueModel, Venues } from "/imports/api/venues/venues";

import * as AsyncTools from "/imports/utils/async-tools";

Meteor.methods({
  /**
   * Update the venue field for all events matching the selector
   */
  "event.updateVenue"(selector) {
    const idOnly = { projection: { _id: 1 } };
    Events.find(selector, idOnly).forEach((originalEvent) => {
      const eventId = originalEvent._id;

      AsyncTools.untilClean((resolve, reject) => {
        const event = Events.findOne(eventId);

        if (!event) {
          // Nothing was successfully updated, we're done.
          resolve(true);
          return;
        }

        if (!_.isObject(event.venue)) {
          // This happens only at creation when the field was not initialized correctly
          Events.update(event._id, { $set: { venue: { name: "" } } });
          resolve(false);
          return;
        }

        let venue: VenueModel | undefined | false = false;
        if (event.venue._id) {
          venue = Venues.findOne(event.venue._id);
        }

        let update: UpdateFilter<EventEntity>;
        if (venue) {
          if (event.start < new Date()) {
            // Do not update venue for historical events
            resolve(true);
            return;
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

        Events.rawCollection().updateMany({ _id: event._id }, update, {}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result?.modifiedCount === 0);
          }
        });
      }).catch((reason) => {
        /* eslint-disable-next-line no-console */
        console.log("Failed event.updateVenue: ", reason);
      });
    });
  },
});
