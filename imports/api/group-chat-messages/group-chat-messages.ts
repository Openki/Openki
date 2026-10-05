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
  /**
   * The account who sent the message.
   */
  userId: string;
  groupId: string;
  /**
   * The group role that should have access to this chat.
   * Users with the coordination `team` role can access all chats so they can coordinate with all roles.
   */
  roleId: string;

  createdAt: Date;
  udpatedAt: Date;
}

export class GroupChatMessagesCollection extends Mongo.Collection<GroupChatMessageEntity> {
  constructor() {
    super("GroupChatMessages");

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ groupId: 1 });
    }
  }
}
export const GroupDiscussions = new GroupChatMessagesCollection();
