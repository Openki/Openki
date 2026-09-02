import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { intersection, assignIn, escapeRegExp } from "lodash-es";
import { Match, check } from "meteor/check";

import { UserModel } from "/imports/api/users/users";
import { EventEntity, OEvent } from "/imports/api/events/events";
import * as tenantDenormalizer from "./tenantDenormalizer";
import * as interestedDenormalizer from "./interestedDenormalizer";

import { hasRoleUser } from "../../utils/group-role-utils";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import * as FileStorage from "/imports/utils/FileStorage";
import { OrganizationCustomGroupFields } from "../organizations/organizations";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { StringEnum, Type } from "/imports/utils/CustomChecks";
import { LocalizedValue } from "/imports/utils/getLocalizedValue";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

export interface GroupMember {
  user: string;
  roles: string[];
  comment?: string;
}

export type GroupCustomField = Pick<
  OrganizationCustomGroupFields,
  "name" | "displayText" | "visibleFor"
> & {
  value: string | boolean;
  displayValue?: LocalizedValue;
};

export type GroupNextEventRef = Pick<
  EventEntity,
  "_id" | "start" | "startLocal" | "venue" | "noRsvp" | "participants"
>;

export type GroupLastEventRef = Pick<
  EventEntity,
  "_id" | "start" | "startLocal" | "venue" | "participants"
>;

/** DB-Model */
export interface GroupEntity {
  _id: string;
  tenant: string;
  name: string;
  /** ID categories */
  categories: string[];
  /** (not used) */
  tags: string[];
  /** List ID_organizations ("promote organizations") */
  organizations: string[];
  /**
   * List of organization ID that are allowed to edit the group ("team organizations", based on the ui design:
   * Every "team organization" promotes the group and is part of the organizations list)
   */
  teamOrganizations: string[];
  description?: string;
  /** small image that is used for the compact view, scaled down to max size (width*height) 500px */
  compactImage: string;
  /** bigger image that is used for the detail view, scaled down to max size (width*height) 1500px */
  image: string;
  slug: string;
  /** ID_region */
  region: string;
  customFields: GroupCustomField[];
  /** ID_user */
  createdby: string;

  time_created: Date;

  time_lastedit: Date;
  /** [role-keys] */
  roles: string[];
  members: GroupMember[];
  internal: boolean;
  singleEvent: boolean;
  archived?: boolean;
  history?:
    | {
        dateTime: Date;
        type: string;
        data: object;
      }[]
    | undefined;
  /**
   * (calculated) List of user and organization id allowed to edit the group, calculated from members
   * and teamOrganizations
   */
  editors: string[];
  /** (calculated) count of events still in the future for this group */
  futureEvents: number;
  /** (calculated) next upcoming event object, only includes the _id and start field */
  nextEvent: GroupNextEventRef | null;
  /** (calculated) most recent event object, only includes the _id and start field */
  lastEvent: GroupLastEventRef | null;
  /** (calculated) based to members.length, to support sorting by number of interested user over url params */
  interested: number;
}

export type GroupModel = Group & GroupEntity;

export function isPrivate(group: { tenant: string }) {
  return !PublicSettings.publicTenants.includes(group.tenant);
}

export class Group {
  members: GroupEntity["members"] = [];

  roles: GroupEntity["roles"] = [];

  teamOrganizations: GroupEntity["teamOrganizations"] = [];

  nextEvent: (GroupNextEventRef & OEvent) | null = null;

  lastEvent: (GroupLastEventRef & OEvent) | null = null;

  /**
   * Check if the group is new (not yet saved).
   */
  isNew(this: GroupModel) {
    return !this._id;
  }

  isPrivate(this: GroupModel) {
    return isPrivate(this);
  }

  hasState(this: GroupModel) {
    if (this.nextEvent) {
      return "upcomingEvent";
    } else if (this.lastEvent) {
      return "resting";
    } else {
      return "proposal";
    }
  }

  /**
   * Check whether a user can edit the group.
   */
  editableBy(this: GroupModel, user: UserModel | null | undefined) {
    if (!user) {
      return false;
    }
    return (
      this.isNew() /* Anyone can create a new group */ ||
      user.hasPrivilege("admin") /* Admins can edit all groups */ ||
      intersection(user.badges, this.editors).length > 0
    );
  }

  /**
   * Get list of members with specified role
   * @param role like 'team'
   */
  membersWithRole(this: GroupModel, role: string) {
    return this.members.filter((member) => member.roles.includes(role));
  }

  userHasRole(this: GroupModel, userId: string | undefined | null, role: string) {
    return hasRoleUser(this.members, role, userId);
  }

  publicUrlForCompactImage(this: GroupModel) {
    if (!this.compactImage) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.compactImage);
  }

  publicUrlForDetailsImage(this: GroupModel) {
    if (!this.image) {
      return undefined;
    }

    return FileStorage.generatePublicUrl(this.image);
  }
}

export const FindFilterPattern = {
  tenants: Match.Maybe([String]),
  region: Match.Maybe(String),
  organization: Match.Maybe(String),
  search: Match.Maybe(String),
  state: Match.Maybe([StringEnum("proposal", "resting", "upcomingEvent")]),
  categories: Match.Maybe([String]),
  needsRole: Match.Maybe([String]),
  internal: Match.Maybe(Boolean),
  archived: Match.Maybe(Boolean),
  userInvolved: Match.Maybe(String),
  createdby: Match.Maybe(String),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export const FindParams = {
  region: Predicates.id,
  organization: Predicates.string,
  search: Predicates.string,
  state: Predicates.createEnumsPredicate("proposal", "resting", "upcomingEvent"),
  categories: Predicates.ids,
  needsRole: Predicates.ids,
  internal: Predicates.flag,
  archived: Predicates.flag,
  userInvolved: Predicates.string,
};

export class GroupsCollection extends Mongo.Collection<GroupEntity, GroupModel> {
  constructor() {
    super("Groups", {
      transform(group) {
        const groupModel = assignIn(new Group(), group);

        if (groupModel.nextEvent) {
          groupModel.nextEvent = assignIn(new OEvent(), groupModel.nextEvent);
        }

        if (groupModel.lastEvent) {
          groupModel.lastEvent = assignIn(new OEvent(), groupModel.lastEvent);
        }

        return groupModel;
      },
    });

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tenant: 1, archived: 1, region: 1, time_lastedit: 1, organizations: 1 });
    }
  }

  async insertAsync(
    group: Mongo.OptionalId<GroupEntity>,
    callback?: (err: unknown | undefined, id?: string) => void,
  ) {
    let enrichedGroup = await tenantDenormalizer.beforeInsert(group);
    enrichedGroup = interestedDenormalizer.beforeInsert(enrichedGroup);

    return super.insertAsync(enrichedGroup, callback);
  }

  Filtering() {
    return new Filtering(FindParams);
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

    const find: Mongo.Selector<GroupEntity> = {};
    const options: Mongo.Options<GroupEntity> = {};
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
        $or.push({ lastEvent: { $eq: null }, nextEvent: { $eq: null } });
      }

      if (filter.state.includes("resting")) {
        $or.push({ lastEvent: { $ne: null }, nextEvent: { $eq: null } });
      }

      if (filter.state.includes("upcomingEvent")) {
        $or.push({ nextEvent: { $ne: null } });

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
      missingRoles.push(...needsRole);
      mustHaveRoles.push(...needsRole);
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

    if (filter.organization) {
      find.organizations = filter.organization;
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

    return this.find(find, options) as Mongo.Cursor<GroupEntity, GroupModel>;
  }
}

export const Groups = new GroupsCollection();
