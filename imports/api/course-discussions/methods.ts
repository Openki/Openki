import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";

import { Courses } from "/imports/api/courses/courses";
import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionUtils from "/imports/utils/course-discussion-utils";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import { Notification } from "../../startup/both/emails/notification";
import * as StringTools from "/imports/utils/string-tools";
import * as HtmlTools from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { HtmlString, SaveString, Type, UnsaveString } from "/imports/utils/CustomChecks";

const sanitizeComment = (comment: { title?: string; text: UnsaveString }) => {
  const saneTitle = StringTools.saneTitle(comment.title || "")
    .substring(0, 200)
    .trim();

  const saneHtml = HtmlTools.saneHtml(comment.text);

  return { title: saneTitle, text: saneHtml };
};

export const PostCommentFieldsPattern = {
  courseId: SaveString(),
  parentId: Match.Optional(SaveString()),
  title: Match.Optional(SaveString()),
  text: HtmlString(),
  anon: Boolean,
  notifyAll: Match.Optional(Boolean),
};
export type PostCommentFields = Type<typeof PostCommentFieldsPattern>;

export const postComment = ServerMethod(
  "courseDiscussion.postComment",
  async function (comment: PostCommentFields) {
    check(comment, PostCommentFieldsPattern);

    const saneComment = sanitizeComment(comment) as CourseDiscussionEnity & { saving?: boolean };

    if (!saneComment.text) {
      throw new Meteor.Error(400, "Invalid comment");
    }

    const course = await Courses.findOneAsync(comment.courseId);
    if (!course) {
      throw new Meteor.Error(404, "course not found");
    }
    saneComment.courseId = course._id;

    const user = await Meteor.userAsync();
    if (user && !comment.anon) {
      saneComment.userId = user._id;
      saneComment.notifyAll =
        comment.notifyAll &&
        (UserPrivilegeUtils.privileged(user, "admin") ||
          course.userHasRole(user._id, "team") ||
          user.groups.some((g) => course?.groupOrganizers.includes(g)));
    }

    const now = new Date();
    saneComment.time_created = now;
    saneComment.time_updated = now;

    if (comment.parentId) {
      const parentComment = await CourseDiscussions.findOneAsync(comment.parentId);

      if (!parentComment) {
        throw new Meteor.Error(404, "parent comment not found");
      }

      if (parentComment.courseId !== comment.courseId) {
        // I could try to mend this but why should I?
        throw new Meteor.Error(400, "Course mismatch");
      }

      // No nesting beyond one level
      if (parentComment.parentId) {
        throw new Meteor.Error(400, "Nesting error");
      }

      saneComment.parentId = parentComment._id;
    }

    if (this.isSimulation) {
      saneComment.saving = true;
    }

    const commentId = await CourseDiscussions.insertAsync(saneComment);

    Notification.Comment.record(commentId);

    return commentId;
  },
);

export const EditCommentFieldsPattern = {
  _id: String,
  title: String,
  text: String,
};
export type EditCommentFields = Type<typeof EditCommentFieldsPattern>;

export const editComment = ServerMethod(
  "courseDiscussion.editComment",
  async (comment: EditCommentFields) => {
    check(comment, EditCommentFieldsPattern);

    const update = sanitizeComment(comment) as CourseDiscussionEnity;

    const originalComment = await CourseDiscussions.findOneAsync(comment._id);
    if (!originalComment) {
      throw new Meteor.Error(404, "no such comment");
    }

    if (!CourseDiscussionUtils.mayEditPost(await Meteor.userAsync(), originalComment)) {
      throw new Meteor.Error(401, "you cant");
    }

    update.time_updated = new Date();

    await CourseDiscussions.updateAsync(originalComment._id, { $set: update });
  },
);

export const deleteComment = ServerMethod(
  "courseDiscussion.deleteComment",
  async (commentId: string) => {
    check(commentId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const comment = await CourseDiscussions.findOneAsync(commentId);
    if (!comment) {
      throw new Meteor.Error(404, "no such comment");
    }

    const course = await Courses.findOneAsync(comment.courseId);

    if (!course) {
      throw new Meteor.Error(401, "delete not permitted");
    }

    if (!CourseDiscussionUtils.mayDeletePost(user, course, comment)) {
      throw new Meteor.Error(401, "delete not permitted");
    }

    await CourseDiscussions.removeAsync({ _id: comment._id });
    await CourseDiscussions.removeAsync({ parentId: comment._id });
  },
);
