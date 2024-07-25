import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import i18next from "i18next";

import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";
import { CourseModel, Courses } from "/imports/api/courses/courses";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { UserModel, Users } from "/imports/api/users/users";
import { Log } from "/imports/api/log/log";

import * as StringTools from "/imports/utils/string-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "./notification";
import { Comment, Props } from "/imports/emails/notifications/comment";

export interface Body {
  commentId: string;
  recipients: string[];
  model: string;
}

/**
 * Record the intent to send event notifications
 * @param commentId ID for the CourseDiscussions collection
 */
export function record(commentId: string) {
  check(commentId, String);
  const comment = CourseDiscussions.findOne(commentId);
  if (!comment) {
    throw new Meteor.Error(`No CourseDiscussion entry for ${commentId}`);
  }

  const course = Courses.findOne(comment.courseId);
  if (!course) {
    throw new Meteor.Error(`No course entry for ${commentId}`);
  }

  let recipients;
  if (comment.notifyAll) {
    recipients = course.members.map((m) => m.user);
  } else {
    recipients = [];

    recipients = course.membersWithRole("team").map((m) => m.user);

    // All participants in the thread are notified.
    const threadId = comment.parentId;
    if (threadId) {
      const threadSelector = {
        $or: [{ _id: threadId }, { parentId: threadId }],
      };

      CourseDiscussions.find(threadSelector).forEach((threadComment) => {
        const partId = threadComment.userId;
        if (partId) {
          recipients.push(partId);
        }
      });
    }

    // Don't send to author of comment
    if (comment.userId) {
      recipients = recipients.filter((r) => r !== comment.userId);
    }

    recipients = _.uniq(recipients);
  }

  const body: Body = {
    commentId: comment._id,
    recipients,
    model: "Comment",
  };

  Log.record("Notification.Send", [course._id, comment._id], body);
}

export function Model(entry: { body: Body }): NotificationModel<Props> {
  const comment = CourseDiscussions.findOne(entry.body.commentId);

  let course: CourseModel | undefined;
  let commenter: UserModel | undefined;
  let commenterName: string | undefined;

  if (comment) {
    course = Courses.findOne(comment.courseId);
    if (comment.userId) {
      commenter = Users.findOne(comment.userId);
    }
    if (commenter) {
      commenterName = commenter.getDisplayName();
    }
  }

  return {
    accepted(actualRecipient) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }

      if (!actualRecipient.hasEmail()) {
        throw new Error("Recipient has no email address registered");
      }
    },

    vars(locale, _actualRecipient, unsubToken) {
      const t = i18next.getFixedT(locale);
      const campaign = "commentNotify";

      if (!comment) {
        throw new Error("Comment does not exist (0.o)");
      }
      if (!course) {
        throw new Error("Course does not exist (0.o)");
      }

      const subjectvars = {
        COURSE: StringTools.truncate(course.name, 10),
        TITLE: StringTools.truncate(comment.title, 50),
        COMMENTER: "",
      };

      let subject;
      if (commenter) {
        subjectvars.COMMENTER = StringTools.truncate(commenterName || "", 20);
        subject = t(
          "notification.comment.mail.subject",
          "Comment on {COURSE} by {COMMENTER}: {TITLE}",
          subjectvars,
        );
      } else {
        subject = t(
          "notification.comment.mail.subject.anon",
          "Anonymous comment on {COURSE}: {TITLE}",
          subjectvars,
        );
      }

      let region: RegionModel | undefined;
      if (course.region) {
        region = Regions.findOne(course.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);
      const courseLink = Router.url("showCourse", course, {
        query: `campaign=${campaign}`,
      });
      const commentLink = Router.url("showCourse", course, {
        query: `select=${comment._id}&campaign=${campaign}`,
      });

      return {
        course: <a href={courseLink}>{course.name}</a>,
        commentLink,
        subject,
        comment,
        commenter,
        commenterLink: Router.url(
          "userprofile",
          { _id: comment.userId, username: commenterName },
          { query: `campaign=${campaign}` },
        ),
        commenterName,
        customSiteUrl: `${Meteor.absoluteUrl()}?campaign=${campaign}`,
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Comment {...props} />,
  };
}
