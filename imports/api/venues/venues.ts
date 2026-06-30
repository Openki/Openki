import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { assignIn, escapeRegExp, chain } from "lodash-es";
import { Match, check } from "meteor/check";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { EventEntity, Events } from "/imports/api/events/events";
import { UserModel } from "/imports/api/users/users";

import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";
import { Geodata } from "/imports/api/Geodata";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

export type FacilityOption = (typeof Venues.facilityOptions)[number];

/** DB-Model */
export interface VenueEntity {
  /** ID */
  _id: string;
  /** user ID */
  editor: string;
  /** a organization that can edit the venue */
  editOrganization?: string;
  name: string;
  slug: string;
  /** HTML */
  description: string;
  /** ID */
  region?: string;
  /** Venue location in GeoJSON format */
  loc: Geodata;
  /** Floor level for custom maps as integer */
  level?: number;
  address: string;
  route: string;
  /** ID */
  short: string;
  /** Int */
  maxPeople: number;
  /** Int */
  maxWorkplaces: number;
  /** For keys see: Venues.facilityOptions */
  facilities: Partial<Record<FacilityOption, boolean>>;
  otherFacilities?: string;
  /** Only hosts and admins can create a event with this venue. */
  restrictedUse?: boolean;
  /** This venue allow overlapping events. */
  allowParallelEvents: boolean;
  /** A url to an ical calendar with existing reservations for this venue */
  bookingIcal?: string;
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

  public allowParallelEvents = true;

  /**
   * Check whether a user can edit the venue.
   */
  editableBy(this: VenueModel, user: UserModel | undefined | null) {
    if (!user) {
      return false;
    }
    const isNew = !this._id;
    return (
      isNew /* Anyone can create a new location */ ||
      user._id === this.editor ||
      (this.editOrganization && user.organizations.includes(this.editOrganization)) ||
      user.hasPrivilige("admin") // Admins can edit all venues
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
        return assignIn(new Venue(), venue);
      },
    });

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ region: 1 });
      if (!PublicSettings.feature.disable2dSphereForLocations) {
        this.createIndex({ loc: "2dsphere" });
      }
    }
  }

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

    const find: Mongo.Selector<VenueEntity> = {};

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
        name: { $regex: escapeRegExp(searchTerm), $options: "i" },
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

      const recentLocations = chain(recentEvents)
        .map((event) => event.venue?._id) // get ids
        .filter((venueId) => venueId) // filter empty ids
        .uniq() // make unique
        .slice(0, limit || 10) // and limit it
        .value();

      find._id = { $in: recentLocations as string[] };
    }

    return this.find(find, options) as Mongo.Cursor<VenueEntity, VenueModel>;
  }
}

export const Venues = new VenueCollection();
