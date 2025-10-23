import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { _ } from "meteor/underscore";

import { UserModel } from "/imports/api/users/users";

import { Filtering } from "/imports/utils/filtering";
import * as FileStorage from "/imports/utils/FileStorage";
import { LocalizedValue } from "/imports/utils/getLocalizedValue";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";

export type GroupEntityCustomCourseFields =
  | {
      /** For internal us, must be unique in the list. */
      name: string;
      /** Used when the value is edited. */
      editText: LocalizedValue;
      /** Used when the value is edited as placeholder in the field. */
      editPlaceholder: LocalizedValue;
      /** Used when the value is shown. It will be copied to the course object. */
      displayText: LocalizedValue;
      /** Who will see the entered values. It will be copied to the course object. */
      visibleFor: "all" | "editors";
      /** Optional: The type of field. 'singleLine' for single-line text, 'multiLine' for multi-line text, boolean for a choice between true and false. Default: 'singleLine' */
      type?: "singleLine" | "multiLine";
    }
  | {
      /** For internal us, must be unique in the list. */
      name: string;
      /** Used when the value is edited. */
      editText: LocalizedValue;
      /** Used when the value is edited as placeholder in the field. */
      editDescription: LocalizedValue;
      /** Used when the value is shown. It will be copied to the course object. */
      displayText: LocalizedValue;
      /** Who will see the entered values. It will be copied to the course object. */
      visibleFor: "all" | "editors";
      /** Optional: The type of field. 'singleLine' for single-line text, 'multiLine' for multi-line text, boolean for a choice between true and false. Default: 'singleLine' */
      type: "boolean";
      /** Optional: By type boolean, you can set the default value. Default: false */
      defaultValue?: boolean;
    };

export interface GroupMemberEntity {
  user: string;
  notify: boolean;
}

export type GroupEntityDashboard = {
  entity: "group" | "course" | "courseWithoutPropose" | "event" | "eventsMap" | "propose";
  title?: string;
  query?: string;
  showAll?: {
    link?: string;
    text?: string;
  };
}[];

export interface GroupVenueEntity {
  _id: string;
  name: string;
  slug: string;
}

/** DB-Model */
export interface GroupEntity {
  /** ID */
  _id: string;
  name: string;
  short: string;
  claim: string;
  description: string;
  logoUrl?: string;
  /** Customize the inputs that the user can enter when creating and editing a course. */
  customCourseFields?: GroupEntityCustomCourseFields[];
  dashboard?: GroupEntityDashboard;
  /** Hide some role options in the propose new course. */
  disableCreateRoles?: string[];
  /** When a team group has this setting set, a message is shown that the registration is closed. */
  registrationClosed?: boolean;
  /** List of userIds with notify */
  members: GroupMemberEntity[];
  createdby?: string;

  time_created?: Date;

  time_lastedit?: Date;
  /** (calculated) venues where the group is manger */
  venues?: GroupVenueEntity[];
}
export type GroupModel = Group & GroupEntity;

export class Group {
  members = [] as GroupMemberEntity[];

  /**
   * Check if the group is new (not yet saved).
   */
  isNew(this: GroupModel) {
    return !this._id;
  }

  /**
   * Check whether a user may edit the group.
   */
  editableBy(this: GroupModel, user: UserModel | null | undefined) {
    if (!user) {
      return false;
    }
    return (
      this.isNew() /* Anybody may create a new group */ ||
      user.privileged("admin") /* Admins can edit all groups */ ||
      this.members?.some((m) => m.user === user._id) /* User must be member of group to edit it */
    );
  }

  publicLogoUrl(this: GroupModel) {
    if (!this.logoUrl) {
      return "";
    }

    return FileStorage.generatePublicUrl(this.logoUrl);
  }
}

export const FindFilterPattern = {
  ids: Match.Maybe([String]),
  /** Limit to groups where logged-in user is a member */
  own: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class GroupsCollection extends Mongo.Collection<GroupEntity, GroupModel> {
  constructor() {
    super("Groups", {
      transform(tenant) {
        return _.extend(new Group(), tenant);
      },
    });

    if (Meteor.isServer) {
      this.createIndex({ members: 1 });
    }
  }

  Filtering() {
    return new Filtering({});
  }

  findFilter(
    filter?: {
      own?: false;
    },
    limit?: number,
    skip?: number,
    sort?: FieldSort[] | undefined,
  ): Mongo.Cursor<GroupEntity, GroupModel>;

  /**
   * Find groups for given filters
   * @param filter dictionary with filter options
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   */
  findFilter(
    filter: FindFilter,
    limit?: number,
    skip?: number,
    sort?: FieldSort[],
  ): Mongo.Cursor<GroupEntity, GroupModel>;

  findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort?: FieldSort[]) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    const find: Mongo.Selector<GroupEntity> = {};

    const options: Mongo.Options<GroupEntity> = { sort };

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.own) {
      const me = Meteor.userId();
      if (!me) {
        // User is not logged in...
        find["members.user"] = "-1";
      }

      find["members.user"] = me;
    }

    if (filter.ids) {
      find._id = { $in: filter.ids };
    }

    return this.find(find, options) as Mongo.Cursor<GroupEntity, GroupModel>;
  }
}

export const Groups = new GroupsCollection();
