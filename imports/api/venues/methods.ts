import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import { Regions } from "/imports/api/regions/regions";
import { VenueEntity, Venues } from "/imports/api/venues/venues";
import * as userVenuesDenormalizer from "../users/venuesDenormalizer";
import * as organizationVenuesDenormalizer from "../organizations/venuesDenormalizer";
import * as eventVenueDenormalizer from "/imports/api/events/venueDenormalizer";

import { HtmlString, StringEnum, Tuple, Type } from "/imports/utils/CustomChecks";
import * as HtmlTools from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as StringTools from "/imports/utils/string-tools";

async function checkEditAllowed(venueId: string) {
  const venue = await Venues.findOneAsync(venueId);
  if (!venue) {
    throw new Meteor.Error(404, "Venue not found");
  }

  if (!venue.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "Please log in");
  }

  return venue;
}

export const SaveFieldPattern = {
  name: Match.Optional(String),
  description: Match.Optional(HtmlString()),
  region: Match.Optional(String),
  loc: Match.Optional(
    Match.OneOf(null, {
      type: StringEnum("Point"),
      coordinates: Tuple<[long: NumberConstructor, lat: NumberConstructor]>(Number, Number),
    }),
  ),
  level: Match.Optional(Match.Integer),
  address: Match.Optional(String),
  route: Match.Optional(String),
  short: Match.Optional(String),
  maxPeople: Match.Optional(Match.Integer),
  maxWorkplaces: Match.Optional(Match.Integer),
  facilities: Match.Optional([StringEnum(...Venues.facilityOptions)]),
  otherFacilities: Match.Optional(String),
  restrictedUse: Match.Optional(Boolean),
  allowParallelEvents: Match.Optional(Boolean),
  bookingIcal: Match.Optional(String),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod(
  "venue.save",
  async (venueId: string, changes: SaveFields) => {
    check(venueId, String);
    check(changes, SaveFieldPattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const isNew = venueId.length === 0;
    if (!isNew) {
      await checkEditAllowed(venueId);
    }

    /* Changes we want to perform */
    const set = { updated: new Date() } as Mongo.OptionalId<VenueEntity>;

    if (changes.description) {
      set.description = HtmlTools.sanitizeHtml(changes.description);
    }
    if (changes.name) {
      set.name = changes.name.trim().substring(0, 1000);
      set.slug = StringTools.slug(set.name);
    }

    if (changes.address !== undefined) {
      set.address = changes.address.trim().substring(0, 40 * 1024);
    }
    if (changes.route !== undefined) {
      set.route = changes.route.trim().substring(0, 40 * 1024);
    }
    if (changes.short !== undefined) {
      set.short = changes.short.trim().substring(0, 40);
    }
    if (changes.loc !== undefined && changes.loc !== null) {
      set.loc = changes.loc;
      set.loc.type = "Point";
    }
    if (changes.level !== undefined) {
      set.level = changes.level;
    }

    if (changes.maxPeople !== undefined) {
      set.maxPeople = Math.min(1e10, Math.max(0, changes.maxPeople));
    }
    if (changes.maxWorkplaces !== undefined) {
      set.maxWorkplaces = Math.min(1e10, Math.max(0, changes.maxWorkplaces));
    }
    if (changes.facilities !== undefined) {
      set.facilities = changes.facilities.reduce((fs: Record<string, boolean>, f) => {
        if (Venues.facilityOptions.includes(f)) {
          fs[f] = true;
        }
        return fs;
      }, {});
    }

    if (changes.otherFacilities !== undefined) {
      set.otherFacilities = changes.otherFacilities.substring(0, 40 * 1024);
    }

    if (changes.restrictedUse !== undefined) {
      set.restrictedUse = changes.restrictedUse;
    }

    if (changes.allowParallelEvents !== undefined) {
      set.allowParallelEvents = changes.allowParallelEvents;
    }

    if (changes.bookingIcal !== undefined) {
      set.bookingIcal = changes.bookingIcal.substring(0, 40 * 1024);
    }

    if (isNew) {
      /* region cannot be changed */
      const region = await Regions.findOneAsync(changes.region);
      if (!region) {
        throw new Meteor.Error(404, "region missing");
      }

      set.region = region._id;

      venueId = await Venues.insertAsync({
        ...set,
        editor: user._id,
        createdby: user._id,
        created: new Date(),
      });

      userVenuesDenormalizer.afterVenueCreate(venueId, user._id);
    } else {
      await Venues.updateAsync({ _id: venueId }, { $set: set });

      await eventVenueDenormalizer.updateVenue({ "venue._id": venueId });
      await organizationVenuesDenormalizer.afterVenueUpdate(venueId);
    }

    return venueId;
  },
  { simulation: false },
);

export const remove = ServerMethod("venue.remove", async (venueId: string) => {
  check(venueId, String);

  const venue = await checkEditAllowed(venueId);

  await userVenuesDenormalizer.beforeVenueRemove(venue);
  await organizationVenuesDenormalizer.beforeVenueRemove(venue);

  const result = await Venues.removeAsync(venueId);

  await eventVenueDenormalizer.updateVenue({ "venue._id": venueId });

  return result;
});

export const addEditOrganization = ServerMethod(
  "venue.editOrganization.add",
  async (venueId: string, organizationId: string) => {
    check(venueId, String);
    check(organizationId, String);

    const venue = await checkEditAllowed(venueId);

    await Venues.updateAsync(venueId, { $set: { editOrganization: organizationId } });

    await userVenuesDenormalizer.afterVenueAddEditOrganization(venue._id, organizationId);
    await organizationVenuesDenormalizer.afterVenueAddEditOrganization(venue, organizationId);
  },
);

export const removeEditOrganization = ServerMethod(
  "venue.editOrganization.remove",
  async (venueId: string) => {
    check(venueId, String);

    const venue = await checkEditAllowed(venueId);
    const organizationId = venue.editOrganization;

    await Venues.updateAsync(venueId, { $unset: { editOrganization: true } });

    if (organizationId) {
      await userVenuesDenormalizer.afterVenueRemoveEditOrganization(venueId, organizationId);
      await organizationVenuesDenormalizer.afterVenueRemoveEditOrganization(
        venueId,
        organizationId,
      );
    }
  },
);
