import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { assignIn } from "lodash-es";
import { Match, check } from "meteor/check";
import { Session } from "meteor/session";

import { UserModel } from "/imports/api/users/users";

import * as Predicates from "/imports/utils/predicates";
import { Filtering } from "/imports/utils/filtering";
import { PublicSettings, RoleEntity, RoleEntityDefault } from "/imports/utils/PublicSettings";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";
import { Geodata } from "/imports/api/Geodata";
import { LocalizedValue } from "/imports/utils/getLocalizedValue";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

export interface CustomMapConfig {
  crs?: "Simple";
  api?: "c3nav";
  /**
   * We support the c3nav v2 api.
   * @example "https://38c3.c3nav.de/api/v2"
   */
  apiUrl?: string;
  layers: { name: string; level: number; tileUrl: string }[];
  defaultLevel: number;
  center: Geodata;
  maxZoom: number;
  attribution: string;
}

export interface RegionEntity {
  /** ID */
  _id: string;
  tenant: string;
  name: string;
  nameEn: string;
  slug: string;
  loc?: Geodata;
  /** ex: "UTC+01:00" */
  tz: string;
  /** description for the user */
  description: string;
  /** Region-specific roles to override the default settings */
  roles?: RoleEntity[];
  /** Allow user on group propose/edit to create custom roles. */
  allowUserCustomRoleCreation?: boolean;
  /**
   * Number of groups in that region, calculated field (does not count internal or archived
   * groups)
   */
  groupCount: number;
  /**
   * Number of future events in that region, calculated field (does not count internal events)
   */
  futureEventCount: number;
  /** ID of featured organization */
  featuredOrganization: string;
  /** Team organizations that is added to all groups on create. */
  defaultTeamOrganizations?: string[];
  /** Groups in this region are default single events. */
  singleEvents?: boolean;
  /**
   * If set the calendar page jumps automatic to this date.
   */
  calendarStartDate?: Date;
  custom?: {
    siteName?: string;
    siteStage?: string;
    /**
     * The logo in the top left corner. Can be a logo from the /public/logo/* folder, from
     * our s3 file storage (must start with the "publicUrlBase" setting) or a base64 encoded
     * string.
     */
    headerLogo?: {
      src: string;
      alt: LocalizedValue;
    };
    /**
     * The logo in the top left corner from the /kiosk/events/ page. Can be a logo from the
     * /public/logo/* folder, from our s3 file storage (must start with the "publicUrlBase"
     * setting) or a base64 encoded string.
     */
    headerLogoKiosk?: {
      src: string;
      alt: LocalizedValue;
    };
    /** Can be a logo from the /private/* folder or a base64 encoded string. */
    emailLogo?: string;

    /** Default images for groups in overviews if none is set on the group. */
    groupBackgroundImages: string[];
  };

  /** for the /api/0/xml/schedule See: https://c3voc.de/wiki/schedule#schedule_xml */
  scheduleXmlData?: {
    acronym: string;
    title: string;
    start: string;
    end: string;
    days: string;
    time_zone_name: string;
    base_url: string;
  };

  dashboard?: {
    entity: "organization" | "group" | "groupWithoutPropose" | "event" | "eventsMap" | "propose";
    title?: LocalizedValue;
    query?: string;
    showAll?: { link?: string; text?: LocalizedValue };
  }[];

  map?: CustomMapConfig;

  createdby?: string;
  created?: Date;
  updated?: Date;
}

export type RegionModel = Region & RegionEntity;

export class Region {
  description: RegionEntity["description"] = "";

  isPrivate(this: RegionModel) {
    return !PublicSettings.publicTenants.includes(this.tenant);
  }

  /**
   * Check whether a user can edit the region.
   */
  editableBy(this: RegionModel, user?: UserModel | null) {
    if (!user) {
      return false;
    }

    return (
      user.hasPrivilege("admin") /* Admins can edit all regions */ ||
      user.isTenantAdmin(this.tenant) /* or admins of a tenant */
    );
  }
}

export const FindFilterPattern = {
  /** restrict to given tenants */
  tenants: Match.Maybe([String]),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class RegionsCollection extends Mongo.Collection<RegionEntity, RegionModel> {
  constructor() {
    super("Regions", {
      transform(regionEntity) {
        const regionModel = assignIn(new Region(), regionEntity);

        if (regionModel.roles) {
          regionModel.roles = regionModel.roles.map((role) => ({
            // set default value for undefined props
            ...RoleEntityDefault,
            ...role,
          }));
        }

        return regionModel;
      },
    });

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tenant: 1 });
      if (!PublicSettings.feature.disable2dSphereForLocations) {
        this.createIndex({ loc: "2dsphere" });
      }
    }
  }

  /**
   * Returns the region from the db based on the session setting.
   */
  currentRegion() {
    const regionId = Session.get("region");

    if (!CleanedRegion(regionId)) {
      return undefined;
    }

    return this.findOne(regionId);
  }

  Filtering() {
    return new Filtering({ tenant: Predicates.id });
  }

  /**
   * Find regions for given filters
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

    const selector: Mongo.Selector<RegionEntity> = {};

    const options: Mongo.Options<RegionEntity> = { sort };

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.tenants && filter.tenants.length > 0) {
      selector.tenant = { $in: filter.tenants };
    }

    return this.find(selector, options) as Mongo.Cursor<RegionEntity, RegionModel>;
  }
}

export const Regions = new RegionsCollection();
