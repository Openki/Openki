import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { _ } from "meteor/underscore";

import { Users } from "/imports/api/users/users";
import * as timeLastEditDenormalizer from "/imports/api/groups/timeLastEditDenormalizer";
import * as courseGroupsDenormalizer from "/imports/api/courses/groupsDenormalizer";
import * as userBadgesDenormalizer from "/imports/api/users/badgesDenormalizer";
import { Group, GroupEntity, GroupModel, Groups } from "./groups";

import * as HtmlTools from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as FileStorage from "/imports/utils/FileStorage";
import { UploadFilePattern } from "/imports/utils/FileStorage";
import { HtmlString, Type } from "/imports/utils/CustomChecks";
import { resizeImage } from "../../utils/resize-image";

async function loadGroup(groupId: string) {
  // new!
  if (groupId === "") {
    return new Group() as GroupModel;
  }

  const group = await Groups.findOneAsync({ _id: groupId });
  if (!group) {
    throw new Meteor.Error(404, "Group not found");
  }
  return group;
}

export const SaveFieldPattern = {
  short: Match.Optional(String),
  name: Match.Optional(String),
  claim: Match.Optional(String),
  description: Match.Optional(HtmlString()),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod("group.save", async (groupId: string, changes: SaveFields) => {
  check(groupId, String);
  check(changes, SaveFieldPattern);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log-in");
  }

  // Load group from DB
  const group = await loadGroup(groupId);

  if (!group.editableBy(user)) {
    throw new Meteor.Error(401, "Denied");
  }

  let updates = {} as Mongo.OptionalId<GroupEntity>;

  if (group.isNew()) {
    // Saving user is added as first member of the group and as creater
    group.members.push({ user: user._id, notify: true });
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
    updates.description = HtmlTools.saneHtml(changes.description);
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
    groupId = await Groups.insertAsync(_.extend(group, updates));
    await userBadgesDenormalizer.updateBadges(user._id);
  } else {
    updates = timeLastEditDenormalizer.beforeUpdate(updates);
    await Groups.updateAsync(group._id, { $set: updates });
  }

  return groupId;
});

export const updateLogo = ServerMethod(
  "group.update.logo",
  async (groupId: string, file: FileStorage.UploadFile) => {
    check(groupId, String);
    check(file, UploadFilePattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = await loadGroup(groupId);

    if (group.isNew() || !group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (!Meteor.isServer) {
      return undefined;
    }

    if (group.logoUrl && !group.logoUrl.startsWith("https://")) {
      FileStorage.remove(group.logoUrl);
    }

    // Note: image scaling also happens on the client
    const resizedImage = await resizeImage(file.content, 600);
    const result = await FileStorage.upload("groups/logos/", {
      content: resizedImage,
      mimeType: file.mimeType,
    });

    const update = { logoUrl: result.fullFileName };

    const enrichedSet = timeLastEditDenormalizer.beforeUpdateLogo(update);
    await Groups.updateAsync(group._id, { $set: enrichedSet });

    return groupId;
  },
  { simulation: false },
);

export const deleteLogo = ServerMethod(
  "group.delete.logo",
  async (groupId: string) => {
    check(groupId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = await loadGroup(groupId);

    if (group.isNew() || !group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (group.logoUrl && !group.logoUrl.startsWith("https://")) {
      FileStorage.remove(group.logoUrl);
    }

    const update: Mongo.Modifier<GroupEntity> = { $unset: { logoUrl: "" } };

    const set = timeLastEditDenormalizer.beforeDeleteLogo();
    await Groups.updateAsync(group._id, { ...update, $set: set });

    return groupId;
  },
  { simulation: false },
);

export const remove = ServerMethod("group.remove", async (groupId: string) => {
  check(groupId, String);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Meteor.Error(404, "No such group");
  }

  if (!group.editableBy(user)) {
    throw new Meteor.Error(401, "not permitted");
  }

  await Groups.removeAsync(groupId);

  // Update list of organizers per course
  await courseGroupsDenormalizer.updateGroups({ groups: groupId });
  // Update List of badges per user
  await userBadgesDenormalizer.updateBadges(user._id);
});

export const updateMembership = ServerMethod(
  "group.updateMembership",
  async (userId: string, groupId: string, join: boolean) => {
    check(userId, String);
    check(groupId, String);

    const sender = await Meteor.userAsync();
    if (!sender) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = await loadGroup(groupId);

    if (group.isNew() || !group.editableBy(sender)) {
      throw new Meteor.Error(401, "Denied");
    }

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    let update;
    if (join) {
      update = { $addToSet: { members: { user: user._id, notify: true } } };
    } else {
      update = { $pull: { members: { user: user._id } } };
    }

    // By using the restrictive selector that checks group membership we can
    // avoid the unlikely race condition where a user is not member anymore
    // but can still add somebody else to the group.
    await Groups.updateAsync(group._id, update);

    await userBadgesDenormalizer.updateBadges(user._id);
  },
);
export const toggleMemberNotify = ServerMethod(
  "group.toggleMemberNotify",
  async (groupId: string) => {
    check(groupId, String);

    const sender = await Meteor.userAsync();
    if (!sender) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const group = await loadGroup(groupId);

    if (group.isNew()) {
      throw new Meteor.Error(401, "Denied");
    }

    const groupMember = group.members.find((m) => m.user === sender._id);

    if (!groupMember) {
      throw new Meteor.Error(401, "Denied");
    }

    await Groups.updateAsync(
      { _id: group._id, "members.user": groupMember.user },
      { $set: { "members.$.notify": !groupMember.notify } },
    );
  },
);
