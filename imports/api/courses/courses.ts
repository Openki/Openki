import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";
import { Match, check } from "meteor/check";

import { UserModel } from "/imports/api/users/users";
import { EventEntity, OEvent } from "/imports/api/events/events";
// eslint-disable-next-line import/no-cycle
import * as tenantDenormalizer from "./tenantDenormalizer";
import * as interestedDenormalizer from "./interestedDenormalizer";

import { hasRoleUser } from "/imports/utils/course-role-utils";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import * as FileStorage from "/imports/utils/FileStorage";
import { escapeRegExp, intersection } from "lodash";
import { GroupEntityCustomCourseFields } from "/imports/api/groups/groups";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { StringEnum, Type } from "/imports/utils/CustomChecks";

export interface CourseMemberEntity {
  user: string;
  roles: string[];
  comment?: string | undefined;
}

export type CourseCustomField = Pick<
  GroupEntityCustomCourseFields,
  "name" | "displayText" | "visibleFor"
> & {
  value: string | boolean;
};

export type CourseNextEventEntity = Pick<
  EventEntity,
  "_id" | "start" | "startLocal" | "venue" | "noRsvp" | "participants"
>;

export type CourseLastEventEntity = Pick<
  EventEntity,
  "_id" | "start" | "startLocal" | "venue" | "participants"
>;

/** DB-Model */
export interface CourseEntity {
  _id: string;
  tenant: string;
  name: string;
  /** ID categories */
  categories: string[];
  /** (not used) */
  tags: string[];
  /** List ID_groups ("promote groups") */
  groups: string[];
  /**
   * List of group ID that are allowed to edit the course ("team groups", based on the ui design:
   * Every "team group" promotes the course and is part of the groups list)
   */
  groupOrganizers: string[];
  description?: string;
  /** small image that is used for the compact view, scaled down to max size (width*height) 500px */
  compactImage: string;
  /** bigger image that is used for the detail view, scaled down to max size (width*height) 1500px */
  image: string;
  slug: string;
  /** ID_region */
  region: string;
  customFields: CourseCustomField[];
  /** ID_user */
  createdby: string;
  // eslint-disable-next-line camelcase
  time_created: Date;
  // eslint-disable-next-line camelcase
  time_lastedit: Date;
  /** [role-keys] */
  roles: string[];
  members: CourseMemberEntity[];
  internal: boolean;
  singleEvent: boolean;
  archived?: boolean;
  history: {
    dateTime: Date;
    type: string;
    data: object;
  }[];
  /**
   * (calculated) List of user and group id allowed to edit the course, calculated from members
   * and groupOrganizers
   */
  editors: string[];
  /** (calculated) count of events still in the future for this course */
  futureEvents: number;
  /** (calculated) next upcoming event object, only includes the _id and start field */
  nextEvent: CourseNextEventEntity | null;
  /** (calculated) most recent event object, only includes the _id and start field */
  lastEvent: CourseLastEventEntity | null;
  /** (calculated) based to members.length, to support sorting by number of interested user over url params */
  interested: number;
}

export type CourseModel = Course & CourseEntity;

export function isPrivate(course: { tenant: string }) {
  return !PublicSettings.publicTenants.includes(course.tenant);
}

export class Course {
  members: CourseMemberEntity[] = [];

  roles: string[] = [];

  groupOrganizers: string[] = [];

  nextEvent: (CourseNextEventEntity & OEvent) | null = null;

  lastEvent: (CourseLastEventEntity & OEvent) | null = null;

  /**
   * Check if the course is new (not yet saved).
   */
  isNew(this: CourseModel) {
    return !this._id;
  }

  isPrivate(this: CourseModel) {
    return isPrivate(this);
  }

  /**
   * Check whether a user may edit the course.
   */
  editableBy(this: CourseModel, user: UserModel | null | undefined) {
    if (!user) {
      return false;
    }
    return (
      this.isNew() /* Anybody may create a new course */ ||
      user.privileged("admin") /* Admins can edit all courses */ ||
      intersection(user.badges, this.editors).length > 0
    );
  }

  /**
   * Get list of members with specified role
   * @param role like 'team'
   */
  membersWithRole(this: CourseModel, role: string) {
    return this.members.filter((member) => member.roles.includes(role));
  }

  userHasRole(this: CourseModel, userId: string | undefined | null, role: string) {
    return hasRoleUser(this.members, role, userId);
  }

  publicUrlForCompactImage(this: CourseModel) {
    if (!this.compactImage) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.compactImage);
  }

  publicUrlForDetailsImage(this: CourseModel) {
    if (!this.image) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.image);
  }
}

export const FindFilterPattern = {
  tenants: Match.Maybe([String]),
  region: Match.Maybe(String),
  group: Match.Maybe(String),
  search: Match.Maybe(String),
  state: Match.Maybe([StringEnum("proposal", "resting", "upcomingEvent")]),
  categories: Match.Maybe([String]),
  needsRole: Match.Maybe([StringEnum("host", "mentor", "team")]),
  internal: Match.Maybe(Boolean),
  archived: Match.Maybe(Boolean),
  userInvolved: Match.Maybe(String),
  createdby: Match.Maybe(String),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class CoursesCollection extends Mongo.Collection<CourseEntity, CourseModel> {
  constructor() {
    super("Courses", {
      transform(course) {
        const courseModel = _.extend(new Course(), course);

        if (courseModel.nextEvent) {
          courseModel.nextEvent = _.extend(new OEvent(), courseModel.nextEvent);
        }

        if (courseModel.lastEvent) {
          courseModel.lastEvent = _.extend(new OEvent(), courseModel.lastEvent);
        }

        return courseModel;
      },
    });

    if (Meteor.isServer) {
      this.createIndex({ tenant: 1, archived: 1, region: 1, time_lastedit: 1, groups: 1 });
    }
  }

  async insertAsync(
    course: Mongo.OptionalId<CourseEntity>,
    callback?: (err: unknown | undefined, id?: string) => void,
  ) {
    let enrichedCourse = await tenantDenormalizer.beforeInsert(course);
    enrichedCourse = interestedDenormalizer.beforeInsert(enrichedCourse);

    return super.insertAsync(enrichedCourse, callback);
  }

  // eslint-disable-next-line class-methods-use-this
  Filtering() {
    return new Filtering({
      region: Predicates.id,
      group: Predicates.string,
      search: Predicates.string,
      state: Predicates.createEnumsPredicate("proposal", "resting", "upcomingEvent"),
      categories: Predicates.ids,
      needsRole: Predicates.createEnumsPredicate("host", "mentor", "team"),
      internal: Predicates.flag,
      archived: Predicates.flag,
      userInvolved: Predicates.string,
    });
  }

  /**
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   */
  findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort: FieldSort[] = []) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    const find: any = {};
    const options: Mongo.Options<CourseEntity> = {};
    const order = sort;

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (!filter.archived) {
      find.archived = { $ne: true }; // hide archived by default
    } else {
      find.archived = { $eq: true }; // only show archived
    }

    if (filter.tenants && filter.tenants.length > 0) {
      find.tenant = { $in: filter.tenants };
    }

    if (filter.region && filter.region !== "all") {
      find.region = filter.region;
    }

    if (filter.state) {
      const $or = [];

      if (filter.state.includes("proposal")) {
        $or.push({ lastEvent: { $eq: null }, futureEvents: { $eq: 0 } });
      }

      if (filter.state.includes("resting")) {
        $or.push({ lastEvent: { $ne: null }, futureEvents: { $eq: 0 } });
      }

      if (filter.state.includes("upcomingEvent")) {
        $or.push({ futureEvents: { $gt: 0 } });
        if (filter.state.length === 1 && order.length === 0) {
          order.push(["nextEvent.start", "asc"]);
        }
      }

      find.$and = [{ $or }];
    }

    if (order.length === 0) {
      order.push(["time_lastedit", "desc"]);
      order.push(["time_created", "desc"]);
    }

    const mustHaveRoles = [];
    const missingRoles = [];

    const { needsRole } = filter;
    if (needsRole) {
      if (needsRole.includes("host")) {
        missingRoles.push("host");
        mustHaveRoles.push("host");
      }

      if (needsRole.includes("mentor")) {
        missingRoles.push("mentor");
        mustHaveRoles.push("mentor");
      }

      if (needsRole.includes("team")) {
        missingRoles.push("team");
        // All courses have the team role so we don't need to restrict to those having it
      }
    }

    if (filter.userInvolved) {
      find["members.user"] = filter.userInvolved;
    }

    if (filter.createdby) {
      find.createdby = filter.createdby;
    }

    if (filter.categories) {
      find.categories = { $all: filter.categories };
    }

    if (filter.group) {
      find.groups = filter.group;
    }

    if (missingRoles.length > 0) {
      find["members.roles"] = { $nin: missingRoles };
    }

    if (mustHaveRoles.length > 0) {
      find.roles = { $all: mustHaveRoles };
    }

    if (filter.internal !== undefined) {
      find.internal = Boolean(filter.internal);
    }

    if (filter.search) {
      const searchTerms = filter.search.split(/\s+/);
      const searchQueries = searchTerms.map((searchTerm) => ({
        $or: [
          { name: { $regex: escapeRegExp(searchTerm), $options: "i" } },
          { description: { $regex: escapeRegExp(searchTerm), $options: "i" } },
        ],
      }));

      find.$and = [...(find.$and || []), ...searchQueries];
    }

    options.sort = order;

    // Load only data that is useful for list views.
    options.projection = {
      "members.comment": 0,
      history: 0,
    };

    return this.find(find, options) as Mongo.Cursor<CourseEntity, CourseModel>;
  }
}

export const Courses = new CoursesCollection();
