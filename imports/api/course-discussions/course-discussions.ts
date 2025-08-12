import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

/** DB-Model */

export interface CourseDiscussionEntity {
  /** ID */
  _id: string;
  title: string;
  text: string;
  /** ID_users undefined if anon comment */
  userId?: string;
  /** ID_Courses */
  courseId: string;
  eventId?: string | undefined;
  notifyAll?: boolean | undefined;

  time_created: Date;

  time_updated: Date;
  /** ID_CourseDiscussions (optional) */
  parentId?: string;
}

export class CourseDiscussionsCollection extends Mongo.Collection<CourseDiscussionEntity> {
  constructor() {
    super("CourseDiscussions");

    if (Meteor.isServer) {
      this.createIndex({ courseId: 1 });
    }
  }
}
export const CourseDiscussions = new CourseDiscussionsCollection();
