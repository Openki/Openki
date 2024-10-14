import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

/** DB-Model */

export interface CourseDiscussionEnity {
  /** ID */
  _id: string;
  title: string;
  text: string;
  /** ID_users undefined if anon comment */
  userId?: string;
  /** ID_Courses */
  courseId: string;
  notifyAll?: boolean | undefined;
  // eslint-disable-next-line camelcase
  time_created: Date;
  // eslint-disable-next-line camelcase
  time_updated: Date;
  /** ID_CourseDiscussions (optional) */
  parentId?: string;
}

export class CourseDiscussionsCollection extends Mongo.Collection<CourseDiscussionEnity> {
  constructor() {
    super("CourseDiscussions");

    if (Meteor.isServer) {
      this.createIndex({ courseId: 1 });
    }
  }
}
export const CourseDiscussions = new CourseDiscussionsCollection();
