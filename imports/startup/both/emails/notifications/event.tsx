import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { uniq } from "lodash";

import { CourseModel, Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Log } from "/imports/api/log/log";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { UserModel } from "/imports/api/users/users";

import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { Event, Props } from "../../../../emails/notifications/Event";
import { getStartEndDate } from "./utils";

interface Body {
  new: boolean;
  eventId: string;
  additionalMessage: string | undefined;
  recipients: string[];
  model: string;
}

/**
 * Record the intent to send event notifications
 * @param eventId event id to announce
 * @param isNew whether the event is a new one
 * @param additionalMessage custom message
 */
export async function record(eventId: string, isNew: boolean, additionalMessage?: string) {
  check(eventId, String);
  check(isNew, Boolean);
  check(additionalMessage, Match.Optional(String));

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  // What do we do when we receive an event which is not attached to a course?
  // For now when we don't have a course we just go through the motions but
  // the recipient list will be empty.
  let course: CourseModel | undefined;
  if (event.courseId) {
    course = await Courses.findOneAsync(event.courseId);
  }

  const body: Body = {
    new: isNew,
    eventId: event._id,
    additionalMessage,

    // The list of recipients is built right away so that only course members
    // at the time of event creation will get the notice even if sending is
    // delayed.
    // The notification is sended to all members of the course and on a event change to all participants
    recipients: uniq([...(course?.members || []), ...(event.participants || [])])?.map(
      (p) => p.user,
    ),
    model: "Event",
  };

  await Log.record("Notification.Send", course ? [course._id] : [], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const event = await Events.findOneAsync(entry.body.eventId);

  let course: CourseModel | undefined;
  if (event?.courseId) {
    course = await Courses.findOneAsync(event.courseId);
  }

  let region: RegionModel | undefined;
  if (event?.region) {
    region = await Regions.findOneAsync(event.region);
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventNotify";

      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!course) {
        throw new Error("Course does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      const { startMoment, tz } = await getStartEndDate(event, locale);

      const subjectvars = {
        TITLE: event.title.substring(0, 30),
        DATE: startMoment.format("LL"),
      };

      let subject;
      if (entry.body.new) {
        subject = t("notification.event.mail.subject.new", "On {DATE}: {TITLE}", subjectvars);
      } else {
        subject = t(
          "notification.event.mail.subject.changed",
          "Fixed {DATE}: {TITLE}",
          subjectvars,
        );
      }

      const siteName = getSiteName(region);
      const emailLogo = region.custom?.emailLogo;

      const courseLink = Router.url("showCourse", course, { query: { campaign } });
      return {
        event,
        tz,
        recipientTakePart: event.participants?.some((p) => p.user === actualRecipient._id),
        registerToEventLink: Router.url("showEvent", event, {
          query: { action: "register", campaign },
        }),
        course: <a href={courseLink}>{course.name}</a>,
        courseName: course.name,
        unsubscribeFromCourseLink: Router.url("showCourse", course, {
          query: { unsubscribe: "participant", force: 1, campaign },
        }),
        isNew: entry.body.new,
        subject,
        additionalMessage: entry.body.additionalMessage,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Event {...props} />,
  };
}
