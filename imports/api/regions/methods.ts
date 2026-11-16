import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { Groups } from "../groups/groups";
import { GroupDiscussions } from "../group-discussions/group-discussions";
import { Events } from "/imports/api/events/events";
import { RegionEntity, Regions } from "./regions";
import { Venues } from "/imports/api/venues/venues";

import { ServerMethod } from "/imports/utils/ServerMethod";
import * as StringTools from "/imports/utils/string-tools";
import { StringEnum, Tuple, Type } from "/imports/utils/CustomChecks";

export const CreateFieldsPattern = {
  tenant: String,
  name: String,
  loc: {
    type: StringEnum("Point"),
    coordinates: Tuple<[long: NumberConstructor, lat: NumberConstructor]>(Number, Number),
  },
  tz: String,
  description: String,
};

export type CreateFields = Type<typeof CreateFieldsPattern>;

export const create = ServerMethod("region.create", async (changes: CreateFields) => {
  check(changes, CreateFieldsPattern);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  if (
    !user.hasPrivilege("admin") /* Admins can add regions */ &&
    !user.isTenantAdmin(changes.tenant) /* or admins of a tenant */
  ) {
    throw new Meteor.Error(401, "not permitted");
  }

  const set = {
    tenant: changes.tenant,
    groupCount: 0,
    futureEventCount: 0,
    createdby: user._id,
    created: new Date(),
    updated: new Date(),
  } as Mongo.OptionalId<RegionEntity>;

  set.name = changes.name.trim().substring(0, 40);
  set.nameEn = set.name;
  set.slug = StringTools.slug(set.name);

  set.loc = changes.loc;
  set.loc.type = "Point";

  set.tz = changes.tz.trim().substring(0, 40);

  set.description = changes.description.trim().substring(0, 1000);

  return Regions.insertAsync(set);
});

export const UpdateFieldsPattern = {
  name: Match.Maybe(String),
  loc: Match.Maybe({
    type: StringEnum("Point"),
    coordinates: Tuple<[long: NumberConstructor, lat: NumberConstructor]>(Number, Number),
  }),
  tz: Match.Maybe(String),
  description: Match.Maybe(String),
};

async function checkEditAllowed(regionId: string) {
  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  const region = await Regions.findOneAsync(regionId);
  if (!region) {
    throw new Meteor.Error(404, "region not found");
  }

  if (!region.editableBy(user)) {
    throw new Meteor.Error(401, "not permitted");
  }
}

export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const update = ServerMethod(
  "region.update",
  async (regionId: string, changes: UpdateFields) => {
    check(regionId, String);
    check(changes, UpdateFieldsPattern);

    await checkEditAllowed(regionId);

    /* Changes we want to perform */

    const set = { updated: new Date() } as Partial<RegionEntity>;

    if (changes.name) {
      set.name = changes.name.trim().substring(0, 40);
      set.nameEn = set.name;
      set.slug = StringTools.slug(set.name);
    }

    if (changes.loc) {
      const loc = changes.loc;
      loc.type = "Point";
      set.loc = loc;
    }

    if (changes.tz) {
      set.tz = changes.tz.trim().substring(0, 40);
    }

    if (changes.description !== undefined) {
      set.description = changes.description.trim().substring(0, 1000);
    }

    await Regions.updateAsync({ _id: regionId }, { $set: set });

    return regionId;
  },
);

export const remove = ServerMethod("region.remove", async (regionId: string) => {
  check(regionId, String);

  await checkEditAllowed(regionId);

  if ((await Groups.countDocuments({ region: regionId })) > 20) {
    throw new Meteor.Error(
      401,
      "Deleting regions with more than 20 groups is not allowed. Delete groups or contact an administrator. For safety reasons. So that an active region is not deleted by mistake.",
    );
  }

  await Events.removeAsync({ region: regionId });
  // GroupDiscussionEntity do not currently have a region.
  for (const g of await Groups.find({ region: regionId }).fetchAsync()) {
    await GroupDiscussions.removeAsync({ groupId: g._id });
  }
  await Groups.removeAsync({ region: regionId });
  await Venues.removeAsync({ region: regionId });
  await Regions.removeAsync(regionId);
});

export const featureOrganization = ServerMethod(
  "region.featureOrganization",
  async (regionId: string, organizationId: string) => {
    check(regionId, String);
    check(organizationId, String);

    await Regions.updateAsync(regionId, { $set: { featuredOrganization: organizationId } });
  },
);

export const unsetFeaturedOrganization = ServerMethod(
  "region.unsetFeaturedOrganization",
  async (regionId: string) => {
    check(regionId, String);

    await Regions.updateAsync(regionId, { $set: { featuredOrganization: "" } });
  },
);
