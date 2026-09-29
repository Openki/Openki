import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { intersection, assignIn, escapeRegExp } from "lodash-es";
import { Match, check } from "meteor/check";

import * as tenantDenormalizer from "./tenantDenormalizer";

import { Geodata } from "/imports/api/Geodata";
import { UserModel } from "/imports/api/users/users";

import { Filtering } from "/imports/utils/filtering";
import { LocalTime } from "/imports/utils/local-time";
import * as Predicates from "/imports/utils/predicates";
import * as FileStorage from "/imports/utils/FileStorage";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { FieldSort, FieldSortPattern, Sort } from "/imports/utils/sort-spec";
import { Tuple, Type } from "/imports/utils/CustomChecks";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { VenueEntity } from "/imports/api/venues/venues";
import { numberOf } from "/imports/api/events/lib/numberOf";

export interface EventParticipant {
  user: string;
  companions?: number;
  removeToken: string;
}

/**
 * This type represents a reference to a venue that is stored in the venues collection.
 * It is used when an event is created with a venue that exists in the venues collection.
 * The `_id` field is used to reference the venue in the venues collection, and the other fields
 * are filled from the venue document.
 */
export type EventVenueRef = Pick<
  VenueEntity,
  "_id" | "name" | "address" | "loc" | "level" | "editor" | "restrictedUse"
>;

/**
 * This type represents a venue that is only used for a specific event and is not stored in the
 * venues collection. It is used when an event is created with a venue that does not exist in the
 * venues collection. The values of the fields are manually entered by the user or pre-filled from
 * a external location service, eg. nominatim (OpenStreetMap).
 */
export interface EventVenue {
  /** Descriptive name for the venue */
  name: string;
  /** Address string where the event will take place */
  address?: string;
  /** Event location in GeoJSON format */
  loc?: Geodata;
  /** Floor level for custom maps as integer */
  level?: number;
}

/** DB-Model */
export interface EventEntity {
  /** ID */
  _id: string;
  /** tenant ID */
  tenant: string;
  /** ID_region */
  region: string;
  title: string;
  slug: string;
  description: string;
  /** (calculated) categories from the group */
  categories?: string[];
  /** String of local date & time when event starts */
  startLocal: string;
  /** String of local date & time when event ends */
  endLocal: string;
  /**
   * Optional reference to a document in the Venues collection. If the `_id` field is set, the fields
   * name, address, loc, level, editor and restrictedUse are filled from the venue document.
   */
  venue?: EventVenue | EventVenueRef;
  /** (Where inside the building the event will take place) */
  room: string;
  /** userId */
  createdBy: string;

  time_created: Date;

  time_lastedit: Date;
  /** group._id of parent group, optional */
  groupId?: string;
  /** (Events are only displayed when organization or venue-filter is active) */
  internal: boolean;
  /** Send a reminder to all attendees of an event just before the event starts */
  sendReminder: boolean;
  /** Shows the event as canceled. */
  canceled?: boolean;
  /** list of organization._id that promote this event ("promote organizations"). */
  organizations: string[];
  /**
   * list of organization._id that are allowed to edit the event ("team organizations", based on the ui design:
   * Every "team organization" promotes the event and is part of the organizations list). */
  teamOrganizations: string[];
  /** ID of the replication parent, only cloned events have this */
  replicaOf?: string;
  participants?: EventParticipant[];
  /** Registration is disabled */
  noRsvp: boolean;
  /** maximum participants of event, 0 means no participant limit */
  maxParticipants: number;
  /**
   * (calculated) list of organization._id inherited from group (if groupId is set) ("promote organizations"
   * from group)
   */
  groupOrganizations: string[];
  /**
   * (calculated) all organizations that promote this group, both inherited from group and set on the
   * event itself ("promote organizations" from event and group)
   */
  allOrganizations?: string[];
  /**
   * (calculated) list of user and organization _id that are allowed to edit the event, calculated from
   * the teamOrganizations from the event and the editors from the group
   */
  editors: string[];
  /**
   * (calculated) date object calculated from startLocal field. Use this for ordering between
   * events.
   */
  start: Date;
  /** (calculated) date object calculated from endLocal field. */
  end: Date;
  /** (calculated) compact image from the group, scaled down to max size (width*height) 500px */
  groupCompactImage: string;
  /** (calculated) details image from the group, scaled down to max size (width*height) 1500px */
  groupImage: string;
}

export type EventModel = OEvent & EventEntity;

// Event is a built-in, so we use a different name for this class
export class OEvent {
  editors: EventEntity["editors"] = [];

  isPrivate(this: EventModel) {
    return !PublicSettings.publicTenants.includes(this.tenant);
  }

  editableBy(this: EventModel, user: UserModel | null | undefined) {
    if (!user) {
      return false;
    }
    if (user.hasPrivilege("admin")) {
      return true;
    }
    return intersection(user.badges, this.editors).length > 0;
  }

  sameTime(
    this: { startLocal: string; endLocal: string },
    event: { startLocal: string; endLocal: string },
  ) {
    return (["startLocal", "endLocal"] as const).every((time) => {
      const timeA = LocalTime.fromString(this[time]);
      const timeB = LocalTime.fromString(event[time]);

      return timeA.hour() === timeB.hour() && timeA.minute() === timeB.minute();
    });
  }

  publicUrlForCompactImage(this: EventModel) {
    if (!this.groupCompactImage) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.groupCompactImage);
  }

  publicUrlForDetailsImage(this: EventModel) {
    if (!this.groupImage) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.groupImage);
  }

  attendedBy(this: EventModel, userId: string | null | undefined) {
    if (!userId) {
      return false;
    }
    return this.participants?.some((p) => p.user === userId) || false;
  }

  numberOfParticipants(this: Pick<EventModel, "participants">) {
    return numberOf(this.participants);
  }

  isFullyBooked(this: EventModel) {
    if (this.noRsvp) {
      return false;
    }
    if (!this.maxParticipants) {
      return false;
    }
    return this.numberOfParticipants() >= this.maxParticipants;
  }

  /** list of organization _ids that are allowed to edit the event, calculated from
   * the teamOrganizations from the event and the group */
  allTeamOrganizations(this: EventModel) {
    return this.allOrganizations?.filter((g) => this.editors.includes(g)) || [];
  }
}

export const FindFilterPattern = {
  /** string of words to search for */
  search: Match.Maybe(String),
  /** include only events that overlap the given period (list of start and end date) */
  period: Match.Maybe(Tuple<[start: DateConstructor, end: DateConstructor]>(Date, Date)),
  /** only events that end after this date (so it also includes ongoning events at this point in time) */
  start: Match.Maybe(Date),
  /**  only events starting after this date */
  after: Match.Maybe(Date),
  /** only events that are ongoing during this date */
  ongoing: Match.Maybe(Date),
  /**
   * only events that ended before this date, if none "after" is given this also changes the
   * order of events
   */
  before: Match.Maybe(Date),
  /** only events that started before this date, (so it also includes ongoing events at this point in time) */
  end: Match.Maybe(Date),
  /** only events at this venue (ID) */
  venue: Match.Maybe(String),
  /** only events at this venues (IDs) */
  venues: Match.Maybe([String]),
  /** only events in this room (string match) */
  room: Match.Maybe(String),
  /** only events that are not attached to a group */
  standalone: Match.Maybe(Boolean),
  /** restrict to given region */
  region: Match.Maybe(String),
  /** restrict to given tenants */
  tenants: Match.Maybe([String]),
  /** list of category ID the event must be in */
  categories: Match.Maybe([String]),
  /** the event must be in that organization (ID) */
  organization: Match.Maybe(String),
  /** the event must be in one of the organization (ID) */
  organizations: Match.Maybe([String]),
  /** the event must be in none of the organization (ID) */
  notOrganization: Match.Maybe(String),
  /** the event must be in none of the organization (ID) */
  notOrganizations: Match.Maybe([String]),
  /** only events for this group (ID) */
  group: Match.Maybe(String),
  /** only events that are internal (if true) or public (if false), Default: Show both */
  internal: Match.Maybe(Boolean),
  /** only events that are canceled (if true) or not canceled (if false), Default: Show both */
  canceled: Match.Maybe(Boolean),
  /** only events with given participant (ID) */
  participant: Match.Maybe(String),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export const FindParams = {
  group: Predicates.id,
  region: Predicates.id,
  participant: Predicates.id,
  search: Predicates.string,
  categories: Predicates.ids,
  organization: Predicates.id,
  organizations: Predicates.ids,
  notOrganization: Predicates.id,
  notOrganizations: Predicates.ids,
  venue: Predicates.id,
  venues: Predicates.ids,
  room: Predicates.string,
  start: Predicates.date,
  after: Predicates.date,
  before: Predicates.date,
  end: Predicates.date,
  internal: Predicates.flag,
  canceled: Predicates.flag,
};

export class EventsCollection extends Mongo.Collection<EventEntity, EventModel> {
  constructor() {
    super("Events", {
      transform(event) {
        return assignIn(new OEvent(), event);
      },
    });

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tenant: 1, region: 1, start: 1 });
      this.createIndex({ tenant: 1, region: 1, end: 1 });
      this.createIndex({ tenant: 1, region: 1, "venue._id": 1 });
      this.createIndex({ tenant: 1, region: 1, allOrganizations: 1 });
    }
  }

  async insertAsync(
    event: Omit<Mongo.OptionalId<EventEntity>, "tenant">,
    callback?: (err?: unknown, _id?: string) => void,
  ) {
    const enrichedEvent = await tenantDenormalizer.beforeInsert(event);

    return super.insertAsync(enrichedEvent, callback);
  }

  Filtering() {
    return new Filtering(FindParams);
  }

  /**
   * Find events for given filters
   * @param filter dictionary with filter options
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   *
   * The events are sorted by start date (ascending, before-filter causes descending order)
   */
  findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort: FieldSort[] = []) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    const find: Mongo.Selector<EventEntity> = {};
    const and = [];

    const options: Mongo.Options<EventEntity> = {};

    let startSortOrder: Sort = "asc";

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.period) {
      find.start = { $lt: filter.period[1] }; // Start date before end of period
      find.end = { $gte: filter.period[0] }; // End date after start of period
    }

    if (filter.start) {
      and.push({ end: { $gte: filter.start } });
    }

    if (filter.end) {
      and.push({ start: { $lte: filter.end } });
    }

    if (filter.after) {
      find.start = { $gt: filter.after };
    }

    if (filter.ongoing) {
      find.start = { $lte: filter.ongoing };
      find.end = { $gte: filter.ongoing };
    }

    if (filter.before) {
      find.end = { $lt: filter.before };
      if (!filter.after) {
        startSortOrder = "desc";
      }
    }

    let inVenues = [];
    if (filter.venue) {
      inVenues.push(filter.venue);
    }

    if (filter.venues) {
      inVenues = inVenues.concat(filter.venues);
    }

    if (inVenues.length > 0) {
      find["venue._id"] = { $in: inVenues };
    }

    if (filter.room) {
      find.room = filter.room;
    }

    if (filter.standalone) {
      find.groupId = { $exists: false };
    }

    if (filter.tenants && filter.tenants.length > 0) {
      find.tenant = { $in: filter.tenants };
    }

    if (filter.region) {
      find.region = filter.region;
    }

    if (filter.categories) {
      find.categories = { $all: filter.categories };
    }

    let inOrganizations = [];
    if (filter.organization) {
      inOrganizations.push(filter.organization);
    }

    if (filter.organizations) {
      inOrganizations = inOrganizations.concat(filter.organizations);
    }

    if (inOrganizations.length > 0) {
      find.allOrganizations = { $in: inOrganizations };
    }

    let notInOrganizations = [];
    if (filter.notOrganization) {
      notInOrganizations.push(filter.notOrganization);
    }

    if (filter.notOrganizations) {
      notInOrganizations = notInOrganizations.concat(filter.notOrganizations);
    }

    if (notInOrganizations.length > 0) {
      find.allOrganizations = { $nin: notInOrganizations };
    }

    if (filter.group) {
      find.groupId = filter.group;
    }

    if (filter.participant) {
      find["participants.user"] = filter.participant;
    }

    if (filter.internal !== undefined) {
      find.internal = Boolean(filter.internal);
    }

    if (filter.canceled !== undefined) {
      if (filter.canceled) {
        find.canceled = { $eq: true };
      } else {
        find.canceled = { $ne: true };
      }
    }

    if (filter.search) {
      const searchTerms = filter.search.split(/\s+/);
      searchTerms.forEach((searchTerm) => {
        and.push({
          $or: [
            { title: { $regex: escapeRegExp(searchTerm), $options: "i" } },
            { description: { $regex: escapeRegExp(searchTerm), $options: "i" } },
          ],
        });
      });
    }

    if (and.length > 0) {
      find.$and = and;
    }

    sort.push(["start", startSortOrder]);

    options.sort = sort;

    return this.find(find, options) as Mongo.Cursor<EventEntity, EventModel>;
  }
}

export const Events = new EventsCollection();
