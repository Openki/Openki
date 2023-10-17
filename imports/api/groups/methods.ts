import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { _ } from "meteor/underscore";

import { Users } from "/imports/api/users/users";
import * as timeLastEditDenormalizer from "/imports/api/groups/timeLastEditDenormalizer";
import { Group, GroupEntity, GroupModel, Groups } from "./groups";

import * as AsyncTools from "/imports/utils/async-tools";
import * as HtmlTools from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as FileStorage from "/imports/utils/FileStorage";
import { UploadFilePattern } from "/imports/utils/FileStorage";
import { Type } from "/imports/utils/CustomChecks";

function loadGroup(groupId: string) {
  // new!
  if (groupId === "") {
    return new Group() as GroupModel;
  }

  const group = Groups.findOne({ _id: groupId });
  if (!group) {
    throw new Meteor.Error(404, "Group not found");
  }
  return group;
}

export const SaveFieldPattern = {
  short: Match.Optional(String),
  name: Match.Optional(String),
  claim: Match.Optional(String),
  description: Match.Optional(String),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod("group.save", (groupId: string, changes: SaveFields) => {
  check(groupId, String);
  check(changes, SaveFieldPattern);

  const user = Meteor.user();
  if (!user) {
    throw new Meteor.Error(401, "please log-in");
  }

  // Load group from DB
  const group = loadGroup(groupId);

  if (!group.editableBy(user)) {
    throw new Meteor.Error(401, "Denied");
  }

  let updates = {} as Mongo.OptionalId<GroupEntity>;

  if (group.isNew()) {
    // Saving user is added as first member of the group and as creater
    group.members.push(user._id);
    updates.createdby = user._id;
    updates.time_created = new Date();
    updates = timeLastEditDenormalizer.beforeInsert(updates);
  }
  if (changes.short !== undefined) {
    let short = changes.short.trim();
    if (short.length === 0) {
      short = `${group.name || changes.name}`;
    }
    updates.short = short.substring(0, 7);
  }
  if (changes.name !== undefined) {
    updates.name = changes.name.substring(0, 50);
  }
  if (changes.claim !== undefined) {
    updates.claim = changes.claim.substring(0, 1000);
  }
  if (changes.description !== undefined) {
    const description = changes.description.substring(0, 640 * 1024);
    if (Meteor.isServer) {
      updates.description = HtmlTools.saneHtml(description);
    } else {
      updates.description = description;
    }
  }

  // Don't update nothing
  if (Object.keys(updates).length === 0) {
    return undefined;
  }

  if (Object.values(updates).some((u) => !u)) {
    throw new Meteor.Error("The name, short, claim and description fields are mandatory.");
  }

  if (group.isNew()) {
    /* eslint-disable-next-line no-param-reassign */
    groupId = Groups.insert(_.extend(group, updates));
    Meteor.call("user.updateBadges", user._id);
  } else {
    updates = timeLastEditDenormalizer.beforeUpdate(updates);
    Groups.update(group._id, { $set: updates });
  }

  return groupId;
});

export const updateLogo = ServerMethod(
  "group.update.logo",
  async (groupId: string, file: FileStorage.UploadFile) => {
    check(groupId, String);
    check(file, UploadFilePattern);

    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = loadGroup(groupId);

    if (group.isNew() || !group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (group.logoUrl && !group.logoUrl.startsWith("https://")) {
      FileStorage.remove(group.logoUrl);
    }

    const result = await FileStorage.upload("groups/logos/", file);

    const update = { logoUrl: result.fullFileName };

    const enrichedSet = timeLastEditDenormalizer.beforeUpdateLogo(update);
    Groups.update(group._id, { $set: enrichedSet });

    return groupId;
  },
  { simulation: false },
);

export const deleteLogo = ServerMethod(
  "group.delete.logo",
  async (groupId: string) => {
    check(groupId, String);

    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = loadGroup(groupId);

    if (group.isNew() || !group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (group.logoUrl && !group.logoUrl.startsWith("https://")) {
      FileStorage.remove(group.logoUrl);
    }

    const update: Mongo.Modifier<GroupEntity> = { $unset: { logoUrl: "" } };

    const set = timeLastEditDenormalizer.beforeDeleteLogo();
    Groups.update(group._id, { ...update, $set: set });

    return groupId;
  },
  { simulation: false },
);

export const remove = ServerMethod("group.remove", (groupId: string) => {
  check(groupId, String);

  const user = Meteor.user();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  const group = Groups.findOne(groupId);
  if (!group) {
    throw new Meteor.Error(404, "No such group");
  }

  if (!group.editableBy(user)) {
    throw new Meteor.Error(401, "not permitted");
  }

  Groups.remove(groupId);

  if (Meteor.isServer) {
    // Update list of organizers per course
    Meteor.call("course.updateGroups", { groups: groupId }, AsyncTools.logErrors);

    // Update List of badges per user
    Meteor.call("user.updateBadges", { groups: groupId }, AsyncTools.logErrors);
  }
});

export const updateMembership = ServerMethod(
  "group.updateMembership",
  (userId: string, groupId: string, join: boolean) => {
    check(userId, String);
    check(groupId, String);

    const sender = Meteor.user();
    if (!sender) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = loadGroup(groupId);

    if (group.isNew() || !group.editableBy(sender)) {
      throw new Meteor.Error(401, "Denied");
    }

    const user = Users.findOne({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    let update;
    if (join) {
      update = { $addToSet: { members: user._id } };
    } else {
      update = { $pull: { members: user._id } };
    }

    // By using the restrictive selector that checks group membership we can
    // avoid the unlikely race condition where a user is not member anymore
    // but can still add somebody else to the group.
    Groups.update(group._id, update);

    if (Meteor.isServer) {
      Meteor.call("user.updateBadges", user._id);
    }
  },
);
