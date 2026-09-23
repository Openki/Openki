import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { uniq, truncate } from "lodash-es";
import i18next from "i18next";

import { GroupDiscussions } from "/imports/api/group-discussions/group-discussions";
import { GroupModel, Groups } from "/imports/api/groups/groups";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { UserModel, Users } from "/imports/api/users/users";
import { Log } from "/imports/api/log/log";

import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { Comment, Props } from "/imports/emails/notifications/Comment";
import { Events } from "/imports/api/events/events";

export const ModelName = "Comment";

export interface Body {
  commentId: string;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send event notifications
 * @param commentId ID for the GroupDiscussions collection
 */
export async function record(commentId: string) {
  check(commentId, String);
  const comment = await GroupDiscussions.findOneAsync(commentId);
  if (!comment) {
    throw new Meteor.Error(`No GroupDiscussion entry for ${commentId}`);
  }

  const group = await Groups.findOneAsync(comment.groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${commentId}`);
  }

  let recipients = [];
  if (comment.notifyAll) {
    recipients.push(...group.members.map((m) => m.user));

    // if a post on a single event all participants also get notified
    if (comment.eventId) {
      const event = await Events.findOneAsync(comment.eventId);
      if (!event) {
        throw new Meteor.Error(`No event entry for ${commentId}`);
      }
      if (event.participants) {
        recipients.push(...event.participants.map((m) => m.user));
      }
    }
  } else {
    recipients.push(...group.membersWithRole("team").map((m) => m.user));

    // All participants in the thread are notified.
    const threadId = comment.parentId;
    if (threadId) {
      const threadSelector = {
        $or: [{ _id: threadId }, { parentId: threadId }],
      };

      await GroupDiscussions.find(threadSelector).forEachAsync((threadComment) => {
        const partId = threadComment.userId;
        if (partId) {
          recipients.push(partId);
        }
      });
    }
  }

  // Don't send to author of comment
  if (comment.userId) {
    recipients = recipients.filter((r) => r !== comment.userId);
  }

  recipients = uniq(recipients);

  const body: Body = {
    commentId: comment._id,
    recipients,
    model: ModelName,
  };

  await Log.record("Notification.Send", [group._id, comment._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const comment = await GroupDiscussions.findOneAsync(entry.body.commentId);

  let group: GroupModel | undefined;
  let commenter: UserModel | undefined;
  let commenterName: string | undefined;

  if (comment) {
    group = await Groups.findOneAsync(comment.groupId);
    if (comment.userId) {
      commenter = await Users.findOneAsync(comment.userId);
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
    },

    async vars(locale, _actualRecipient, unsubToken) {
      const t = i18next.getFixedT(locale);
      const campaign = "commentNotify";

      if (!comment) {
        throw new Error("Comment does not exist (0.o)");
      }
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }

      const subjectvars = {
        GROUP: truncate(group.name, { length: 10 }),
        TITLE: truncate(comment.title, { length: 50 }),
        COMMENTER: "",
      };

      let subject;
      if (commenter) {
        subjectvars.COMMENTER = truncate(commenterName, { length: 20 });
        subject = t(
          "notification.comment.mail.subject",
          "Comment on {GROUP} by {COMMENTER}: {TITLE}",
          subjectvars,
        );
      } else {
        subject = t(
          "notification.comment.mail.subject.anon",
          "Anonymous comment on {GROUP}: {TITLE}",
          subjectvars,
        );
      }

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);
      const groupLink = Router.url("showGroup", group, {
        query: { campaign },
      });
      const commentLink = Router.url("showGroup", group, {
        query: { select: comment._id, campaign },
      });

      return {
        group: <a href={groupLink}>{group.name}</a>,
        commentLink,
        subject,
        comment,
        commenter,
        commenterLink: Router.url(
          "userprofile",
          { _id: comment.userId, username: commenterName },
          { query: { campaign } },
        ),
        commenterName,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Comment {...props} />,
  };
}
