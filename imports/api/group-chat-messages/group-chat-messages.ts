import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

/** DB-Model */

export interface GroupChatMessageEntity {
  /** ID */
  _id: string;
  /**
   * Message content. Initially plain text.
   */
  content: string;
  groupId: string;
  /**
   * The group role that should have access to this chat.
   * Users with the coordination `team` role can access all chats so they can coordinate with all roles.
   */
  roleId: string;
  /**
   * The user who sent the message.
   */
  userId: string;

  createdAt: Date;
  updatedAt: Date;
}

class GroupChatMessagesCollection extends Mongo.Collection<GroupChatMessageEntity> {
  constructor() {
    super("GroupChatMessages");

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ groupId: 1 });
    }
  }
}
export const GroupChatMessages = new GroupChatMessagesCollection();
