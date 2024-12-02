import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { Courses } from "/imports/api/courses/courses";
import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";
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
    !user.privileged("admin") /* Admins can add regions */ &&
    !user.isTenantAdmin(changes.tenant) /* or admins of a tenant */
  ) {
    throw new Meteor.Error(401, "not permitted");
  }

  const set = {
    tenant: changes.tenant,
    courseCount: 0,
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
  // Todo: check this already when the user writes into the textarea? is there a limit for course descriptions?

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

export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const update = ServerMethod(
  "region.update",
  async (regionId: string, changes: UpdateFields) => {
    check(regionId, String);
    check(changes, UpdateFieldsPattern);

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

  if ((await Courses.find({ region: regionId }).countAsync()) > 20) {
    throw new Meteor.Error(
      401,
      "Deleting regions with more than 20 courses is not allowed. Delete courses or contact an administrator. For safety reasons. So that an active region is not deleted by mistake.",
    );
  }

  await Events.removeAsync({ region: regionId });
  // CourseDiscussionEntity do not currently have a region.
  for (const c of await Courses.find({ region: regionId }).fetchAsync()) {
    // eslint-disable-next-line no-await-in-loop
    await CourseDiscussions.removeAsync({ courseId: c._id });
  }
  await Courses.removeAsync({ region: regionId });
  await Venues.removeAsync({ region: regionId });
  await Regions.removeAsync(regionId);
});

export const featureGroup = ServerMethod(
  "region.featureGroup",
  async (regionId: string, groupId: string) => {
    check(regionId, String);
    check(groupId, String);

    await Regions.updateAsync(regionId, { $set: { featuredGroup: groupId } });
  },
);

export const unsetFeaturedGroup = ServerMethod(
  "region.unsetFeaturedGroup",
  async (regionId: string) => {
    check(regionId, String);

    await Regions.updateAsync(regionId, { $set: { featuredGroup: "" } });
  },
);
