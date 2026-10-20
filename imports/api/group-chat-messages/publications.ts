import { check } from "meteor/check";

import { GroupChatMessages } from "./group-chat-messages";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { Meteor } from "meteor/meteor";
import { Groups } from "../groups/groups";

export const [groupChatMessages, useGroupChatMessages] = ServerPublishMany(
  "groupChatMessages",
  async (groupId: string, roleId: string) => {
    check(groupId, String);
    check(roleId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await Groups.findOneAsync(groupId);
    if (!group) {
      throw new Meteor.Error(404, `Group not found: ${groupId}`);
    }

    const role = group.roles.find((groupRole) => groupRole.id === roleId);
    if (!role) {
      throw new Meteor.Error(404, `Group ${groupId} does not have role ${roleId}`);
    }

    const groupRoleChatParticipants = group.getGroupChatParticipants(role);
    if (!groupRoleChatParticipants.some((member) => member.user === user._id)) {
      throw new Meteor.Error(403, `User can not access group chat for role ${roleId}`);
    }

    return GroupChatMessages.find({ groupId, roleId }, { sort: { createdAt: "asc" } });
  },
  (groupId: string, roleId: string) => {
    return GroupChatMessages.find({ groupId, roleId });
  },
);
