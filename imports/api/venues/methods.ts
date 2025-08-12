import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import { Regions } from "/imports/api/regions/regions";
import { VenueEntity, Venues } from "/imports/api/venues/venues";
import * as userVenuesDenormalizer from "../users/venuesDenormalizer";
import * as groupVenuesDenormalizer from "/imports/api/groups/venuesDenormalizer";

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
  address: Match.Optional(String),
  route: Match.Optional(String),
  short: Match.Optional(String),
  maxPeople: Match.Optional(Match.Integer),
  maxWorkplaces: Match.Optional(Match.Integer),
  facilities: Match.Optional([StringEnum(...Venues.facilityOptions)]),
  otherFacilities: Match.Optional(String),
  restrictedUse: Match.Optional(Boolean),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod("venue.save", async (venueId: string, changes: SaveFields) => {
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

  if (changes.maxPeople !== undefined) {
    set.maxPeople = Math.min(1e10, Math.max(0, changes.maxPeople));
  }
  if (changes.maxWorkplaces !== undefined) {
    set.maxWorkplaces = Math.min(1e10, Math.max(0, changes.maxWorkplaces));
  }
  if (changes.facilities !== undefined) {
    set.facilities = changes.facilities.reduce((originalFs: Record<string, boolean>, f) => {
      const fs = { ...originalFs };
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
  }

  return venueId;
});

export const remove = ServerMethod("venue.remove", async (venueId: string) => {
  check(venueId, String);

  const venue = await checkEditAllowed(venueId);

  await userVenuesDenormalizer.beforeVenueRemove(venue);
  await groupVenuesDenormalizer.beforeVenueRemove(venue);

  return Venues.removeAsync(venueId);
});

export const addEditGroup = ServerMethod(
  "venue.editGroup.add",
  async (venueId: string, groupId: string) => {
    check(venueId, String);
    check(groupId, String);

    const venue = await checkEditAllowed(venueId);

    await Venues.updateAsync(venueId, { $set: { editGroup: groupId } });

    await userVenuesDenormalizer.afterVenueAddEditGroup(venue._id, groupId);
    await groupVenuesDenormalizer.afterVenueAddEditGroup(venue, groupId);
  },
);

export const removeEditGroup = ServerMethod("venue.editGroup.remove", async (venueId: string) => {
  check(venueId, String);

  const venue = await checkEditAllowed(venueId);
  const groupId = venue.editGroup;

  await Venues.updateAsync(venueId, { $unset: { editGroup: true } });

  if (groupId) {
    await userVenuesDenormalizer.afterVenueRemoveEditGroup(venueId, groupId);
    await groupVenuesDenormalizer.afterVenueRemoveEditGroup(venueId, groupId);
  }
});
