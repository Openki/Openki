import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";
import { Match, check } from "meteor/check";

import { EventEntity, Events } from "/imports/api/events/events";
import { UserModel } from "/imports/api/users/users";
import { Geodata } from "/imports/api/regions/regions";

import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import * as StringTools from "/imports/utils/string-tools";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";

export type FacilityOption = (typeof Venues.facilityOptions)[number];

/** DB-Model */
export interface VenueEntity {
  /** ID */
  _id: string;
  /** user ID */
  editor: string;
  name: string;
  slug: string;
  /** HTML */
  description: string;
  /** ID */
  region?: string;
  loc: Geodata;
  address: string;
  route: string;
  /** ID */
  short: string;
  /** Int */
  maxPeople: number;
  /** Int */
  maxWorkplaces: number;
  /** For keys see: Venues.facilityOptions */
  facilities: Partial<{
    [key in FacilityOption]: boolean;
  }>;
  otherFacilities?: string;
  createdby: string;
  created: Date;
  updated: Date;
}

export type VenueModel = Venue & VenueEntity;

/**
 * Venue objects represent locations where events take place.
 */
export class Venue {
  public name = "";

  public description = "";

  public address = "";

  public route = "";

  public short = "";

  public maxPeople = 0;

  public maxWorkplaces = 0;

  public facilities = {};

  /**
   * Check whether a user may edit the venue.
   */
  editableBy(this: VenueModel, user: UserModel | undefined | null) {
    if (!user) {
      return false;
    }
    const isNew = !this._id;
    return (
      isNew /* Anybody may create a new location */ ||
      user._id === this.editor ||
      user.privileged("admin") // Admins can edit all venues
    );
  }
}

export const FindFilterPattern = {
  /** string of words to search for */
  search: Match.Maybe(String),
  /** restrict to venues in that region */
  region: Match.Maybe(String),
  editor: Match.Maybe(String),
  recent: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export const FindParams = { region: Predicates.id };

export class VenueCollection extends Mongo.Collection<VenueEntity, VenueModel> {
  facilityOptions = [
    "projector",
    "screen",
    "audio",
    "blackboard",
    "whiteboard",
    "flipchart",
    "wifi",
    "kitchen",
    "wheelchairs",
  ] as const;

  constructor() {
    super("Venues", {
      transform(venue) {
        return _.extend(new Venue(), venue);
      },
    });

    if (Meteor.isServer) {
      this.createIndex({ region: 1 });
      this.createIndex({ loc: "2dsphere" });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  Filtering() {
    return new Filtering(FindParams);
  }

  /**
   * Find venues for given filters
   * @param filter dictionary with filter options
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   */
  findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort?: FieldSort[]) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    const find: any = {};

    const options: Mongo.Options<VenueEntity> = { sort };

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.editor) {
      find.editor = filter.editor;
    }

    if (filter.region) {
      find.region = filter.region;
    }

    if (filter.search) {
      const searchTerms = filter.search.split(/\s+/);
      find.$and = searchTerms.map((searchTerm) => ({
        name: { $regex: StringTools.escapeRegex(searchTerm), $options: "i" },
      }));
    }

    if (filter.recent) {
      const findRecent: Mongo.Selector<EventEntity> = {
        "venue._id": { $exists: true },
      };
      if (filter.region) {
        findRecent.region = filter.region;
      }
      const findRecentOptions: Mongo.Options<EventEntity> = {
        sort: { time_lastedit: -1 },
        limit: (limit || 10) * 1.5, // Get more so after distinct/uniq we reach the limit
        projection: { "venue._id": 1 },
      };

      const recentEvents = Events.find(findRecent, findRecentOptions).fetch();

      const recentLocations = [
        ...new Set(
          recentEvents
            .map((event) => event.venue?._id) // get ids
            .filter((venueId) => venueId), // filter empty ids
        ),
      ] // make unique with Set
        .slice(0, limit || 10); // and limit it

      find._id = { $in: recentLocations as string[] };
    }

    return this.find(find, options) as Mongo.Cursor<VenueEntity, VenueModel>;
  }
}

export const Venues = new VenueCollection();
