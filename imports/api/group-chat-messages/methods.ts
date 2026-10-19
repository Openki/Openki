import { GroupChatMessages } from "./group-chat-messages";
import { Groups } from "/imports/api/groups/groups";
import { Type } from "/imports/utils/CustomChecks";
import { sanitizeHtml } from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";

// TODO: Test with group: http://localhost:3000/group/5dbf3bec62/elektronik#discussion
function sanitizeMessage(rawMessage: { content: string; groupId: string; roleId: string }) {
  return {
    content: sanitizeHtml(rawMessage.content),
    groupId: rawMessage.groupId,
    roleId: rawMessage.roleId,
  };
}

export const SendGroupChatMessagePattern = {
  groupId: String,
  content: String,
  roleId: String,
};

export type SendGroupChatMessage = Type<typeof SendGroupChatMessagePattern>;

export const sendMessage = ServerMethod(
  "groupChatMessages.send",
  async function (rawMessage: SendGroupChatMessage) {
    check(rawMessage, SendGroupChatMessagePattern);

    const message = sanitizeMessage(rawMessage);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await Groups.findOneAsync(message.groupId);
    if (!group) {
      throw new Meteor.Error(404, `Group with id "${message.groupId}" does not exist`);
    }

    const role = group.roles.find((groupRole) => groupRole.id === message.roleId);
    if (!role) {
      throw new Meteor.Error(400, `Role with id "${message.roleId}" does not exist`);
    }

    // TODO: Only include each group member once
    // TODO: Verify this works as expected by running it in dev
    // const groupRoleChatParticipants = [
    //   // Group members with the specific role
    //   ...group.membersWithRole(role),
    //   // The team role can participate in all group role chats.
    //   ...group.membersWithRole(SystemRoles.Team),
    // ];

    const groupRoleChatParticipants = group.getGroupChatParticipants(role);

    // Only allow sending messages when there are at least two participants.
    if (groupRoleChatParticipants.length < 2) {
      throw new Meteor.Error(400, "Too few participants in group role chat");
    }

    // Ensure the user can send chat messages to the specific role
    if (!groupRoleChatParticipants.some((member) => member.user === user._id)) {
      throw new Meteor.Error(400, "The current user cannot access the group role chat");
    }

    const now = new Date();

    await GroupChatMessages.insertAsync({
      content: message.content,
      userId: user._id,
      groupId: group._id,
      roleId: role.id,
      createdAt: now,
      updatedAt: now,
    });

    // TODO: send email notifications
  },
);
