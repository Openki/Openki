import { Type } from "/imports/utils/CustomChecks";
import { sanitizeHtml } from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";

// TODO: Test with group: http://localhost:3000/group/5dbf3bec62/elektronik#discussion
function sanitizeMessage(rawMessage: { groupId: string; content: string }) {
  return {
    // TODO: Sanitize the groupId somehow.
    groupId: rawMessage.groupId,
    content: sanitizeHtml(rawMessage.content),
  };
}

export const SendGroupChatMessagePattern = {
  groupId: String,
  content: String,
};

export type SendGroupChatMessage = Type<typeof SendGroupChatMessagePattern>;

export const sendMessage = ServerMethod(
  "groupChatMessages.send",
  async function (rawMessage: SendGroupChatMessage) {
    check(rawMessage, SendGroupChatMessagePattern);

    const message = sanitizeMessage(rawMessage);
  },
);
