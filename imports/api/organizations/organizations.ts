import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { assignIn } from "lodash-es";

import { UserModel } from "/imports/api/users/users";
import { VenueEntity } from "/imports/api/venues/venues";

import { Filtering } from "/imports/utils/filtering";
import * as FileStorage from "/imports/utils/FileStorage";
import { LocalizedValue } from "/imports/utils/getLocalizedValue";
import * as Predicates from "/imports/utils/predicates";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

export type OrganizationCustomGroupFields =
  | {
      /** For internal use, must be unique in the list. */
      name: string;
      /** Used when the value is edited. */
      editText: LocalizedValue;
      /** Used when the value is edited as placeholder in the field. */
      editPlaceholder: LocalizedValue;
      /** Used when the value is shown. It will be copied to the group object. */
      displayText: LocalizedValue;
      /** Who will see the entered values. It will be copied to the group object. */
      visibleFor: "all" | "editors";
      /** Optional: The type of field. 'singleLine' for single-line text, 'multiLine' for multi-line text, boolean for a choice between true and false. Default: 'singleLine' */
      type?: "singleLine" | "multiLine";
    }
  | {
      /** For internal use, must be unique in the list. */
      name: string;
      /** Used when the value is edited. */
      editText: LocalizedValue;
      /** Used when the value is shown. It will be copied to the group object. */
      displayText: LocalizedValue;
      /** Who will see the entered values. It will be copied to the group object. */
      visibleFor: "all" | "editors";
      /** Optional: The type of field. 'singleLine' for single-line text, 'multiLine' for multi-line text, 'option' a choice from a selection of values, 'boolean' for a choice between true and false. Default: 'singleLine' */
      type: "option";
      options: Record<string, LocalizedValue>;
      /** Optional: By type 'option', you can set the default value. */
      defaultValue?: string;
    }
  | {
      /** For internal use, must be unique in the list. */
      name: string;
      /** Used when the value is edited. */
      editText: LocalizedValue;
      /** Used when the value is edited as placeholder in the field. */
      editDescription: LocalizedValue;
      /** Used when the value is shown. It will be copied to the group object. */
      displayText: LocalizedValue;
      /** Who will see the entered values. It will be copied to the group object. */
      visibleFor: "all" | "editors";
      /** Optional: The type of field. 'singleLine' for single-line text, 'multiLine' for multi-line text, boolean for a choice between true and false. Default: 'singleLine' */
      type: "boolean";
      /** Optional: By type 'boolean', you can set the default value. Default: false */
      defaultValue?: boolean;
    };

export interface OrganizationMember {
  user: string;
  notify: boolean;
}

export type OrganizationDashboard = {
  entity: "organization" | "group" | "groupWithoutPropose" | "event" | "eventsMap" | "propose";
  title?: string;
  query?: string;
  showAll?: {
    link?: string;
    text?: string;
  };
}[];

export type OrganizationVenueRef = Pick<VenueEntity, "_id" | "name" | "slug">;

/** DB-Model */
export interface OrganizationEntity {
  /** ID */
  _id: string;
  name: string;
  short: string;
  claim: string;
  description: string;
  logoUrl?: string;
  /** Customize the inputs that the user can enter when creating and editing a group. */
  customGroupFields?: OrganizationCustomGroupFields[];
  dashboard?: OrganizationDashboard;
  /** Hide some role options in the propose new group. */
  disableCreateRoles?: string[];
  /** When a team organization has this setting set, a message is shown that the registration is closed. */
  registrationClosed?: boolean;
  /** List of userIds with notify */
  members: OrganizationMember[];
  createdby?: string;

  time_created?: Date;

  time_lastedit?: Date;
  /** (calculated) venues where the organization is manger */
  venues?: OrganizationVenueRef[];
}
export type OrganizationModel = Organization & OrganizationEntity;

export class Organization {
  members: OrganizationEntity["members"] = [];

  /**
   * Check if the organization is new (not yet saved).
   */
  isNew(this: OrganizationModel) {
    return !this._id;
  }

  /**
   * Check whether a user can edit the organization.
   */
  editableBy(this: OrganizationModel, user: UserModel | null | undefined) {
    if (!user) {
      return false;
    }
    return (
      this.isNew() /* Anyone can create a new organization */ ||
      user.hasPrivilege("admin") /* Admins can edit all organizations */ ||
      this.members?.some(
        (m) => m.user === user._id,
      ) /* User must be member of organization to edit it */
    );
  }

  publicLogoUrl(this: OrganizationModel) {
    if (!this.logoUrl) {
      return "";
    }

    return FileStorage.generatePublicUrl(this.logoUrl);
  }
}

export const FindFilterPattern = {
  ids: Match.Maybe([String]),
  /** Limit to organizations where logged-in user is a member */
  own: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export const FindParams = {
  ids: Predicates.ids,
};

export class OrganizationsCollection extends Mongo.Collection<
  OrganizationEntity,
  OrganizationModel
> {
  constructor() {
    super("Organizations", {
      transform(tenant) {
        return assignIn(new Organization(), tenant);
      },
    });

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ members: 1 });
    }
  }

  Filtering() {
    return new Filtering(FindParams);
  }

  /**
   * Find organizations for given filters
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

    const find: Mongo.Selector<OrganizationEntity> = {};

    const options: Mongo.Options<OrganizationEntity> = { sort };

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

    return this.find(find, options) as Mongo.Cursor<OrganizationEntity, OrganizationModel>;
  }
}

export const Organizations = new OrganizationsCollection();
