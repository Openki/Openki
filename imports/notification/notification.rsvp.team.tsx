import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";

import { Courses } from "/imports/api/courses/courses";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";
import { Events } from "/imports/api/events/events";
import { Model as NotificationModel } from "./notification";
import { RsvpTeam, Props } from "../emails/notifications/rsvp.team";

import { getSiteName } from "/imports/utils/getSiteName";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { LocalTime } from "/imports/utils/local-time";

interface Body {
  eventId: string;
  courseId: string;
  participantId: string;
  companions: number;
  recipients: string[];
  model: string;
}

export function record(eventId: string, participantId: string, companions: number) {
  check(eventId, String);
  check(participantId, String);
  check(companions, Number);

  const event = Events.findOne(eventId);
  if (!event) {
    throw new Meteor.Error(`No event entry for ${eventId}`);
  }

  const participant = Users.findOne(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  if (!event.courseId) {
    throw new Meteor.Error(`Event has no course`);
  }

  const course = Courses.findOne(event.courseId);
  if (!course) {
    throw new Meteor.Error(`No course entry for ${event.courseId}`);
  }

  const body: Body = {
    eventId: event._id,
    courseId: course._id,
    participantId: participant._id,
    companions,

    // Don't send to new member, they know
    recipients: course
      .membersWithRole("team")
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: "Rsvp.Team",
  };

  Log.record("Notification.Send", [course._id, event._id, participant._id], body);
}

export function Model(entry: { body: Body }): NotificationModel<Props> {
  const { body } = entry;
  const event = Events.findOne(body.eventId);
  const course = Courses.findOne(body.courseId);
  const newParticipant = Users.findOne(body.participantId);

  let region: RegionModel | undefined;
  if (event?.region) {
    region = Regions.findOne(event.region);
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
      if (!actualRecipient.hasEmail()) {
        throw new Error("Recipient has no email address registered");
      }
    },

    vars(locale: string, _actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);

      if (!newParticipant) {
        throw new Error("New participant does not exist (0.o)");
      }
      if (!course) {
        throw new Error("Course does not exist (0.o)");
      }
      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      // Show dates in local time and in users locale
      const regionZone = LocalTime.zone(event.region);

      const startMoment = regionZone.at(event.start);
      startMoment.locale(locale);

      const endMoment = regionZone.at(event.end);
      endMoment.locale(locale);

      const subjectvars = {
        TITLE: event.title.substring(0, 30),
        DATE: startMoment.format("LL"),
      };

      const subject = t(
        "notification.rsvp.team.mail.subject",
        "{DATE} {TITLE} - User just reserved a seat",
        subjectvars,
      );

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const eventFullTitle = t("notification.rsvp.team.mail.title", "{DATE} — {EVENT}", {
        EVENT: event.title,
        DATE: startMoment.calendar(),
      });
      const eventUrl = Router.url("showEvent", event, {
        query: "campaign=rsvpTeamNotify",
      });

      const eventTitle = <a href={eventUrl}>{eventFullTitle}</a>;
      return {
        unsubLink: Router.url("profileNotificationsUnsubscribe", { token: unsubToken }),
        course: course.name,
        event: eventTitle,
        newParticipant: <strong>{newParticipant.getDisplayName()}</strong>,
        companionsOfNewParticipant: body.companions,
        subject,
        participantsCount: event.numberOfParticipants(),
        email: <span style={{ color: "blue" }}>{PrivateSettings.siteEmail}</span>,
        customSiteUrl: `${Meteor.absoluteUrl()}?campaign=rsvpTeamNotify`,
        customSiteName: siteName,
        customEmailLogo: emailLogo,
      };
    },
    template: (props) => <RsvpTeam {...props} />,
  };
}
