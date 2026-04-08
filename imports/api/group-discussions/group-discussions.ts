import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

/** DB-Model */

export interface GroupDiscussionEntity {
  /** ID */
  _id: string;
  title: string;
  text: string;
  /** users ID, undefined if anonymous comment */
  userId?: string;
  groupId: string;
  eventId?: string | undefined;
  notifyAll?: boolean | undefined;

  time_created: Date;

  time_updated: Date;
  /** Parent GroupDiscussion ID (optional) */
  parentId?: string;
}

export class GroupDiscussionsCollection extends Mongo.Collection<GroupDiscussionEntity> {
  constructor() {
    super("CourseDiscussions");

    if (Meteor.isServer) {
      this.createIndex({ groupId: 1 });
    }
  }
}
export const GroupDiscussions = new GroupDiscussionsCollection();
