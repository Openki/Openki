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
import { Model as NotificationModel } from "../notification";
import { RsvpTeam, Props } from "../../../../emails/notifications/RsvpTeam";

import { getSiteName } from "/imports/utils/getSiteName";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { LocalTime } from "/imports/utils/local-time";

interface Body {
  eventId: string;
  courseId: string;
  participantId: string;
  recipients: string[];
  model: string;
}

export async function record(eventId: string, participantId: string) {
  check(eventId, String);
  check(participantId, String);

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event entry for ${eventId}`);
  }

  const participant = await Users.findOneAsync(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  if (!event.courseId) {
    throw new Meteor.Error(`Event has no course`);
  }

  const course = await Courses.findOneAsync(event.courseId);
  if (!course) {
    throw new Meteor.Error(`No course entry for ${event.courseId}`);
  }

  const body: Body = {
    eventId: event._id,
    courseId: course._id,
    participantId: participant._id,

    // Don't send to new member, they know
    recipients: course
      .membersWithRole("team")
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: "Rsvp.Team",
  };

  await Log.record("Notification.Send", [course._id, event._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const event = await Events.findOneAsync(body.eventId);
  const course = await Courses.findOneAsync(body.courseId);
  const newParticipant = await Users.findOneAsync(body.participantId);

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

    async vars(locale: string, _actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "rsvpTeamNotify";

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
      const regionZone = await LocalTime.zone(event.region);

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
        query: { campaign },
      });

      const eventTitle = <a href={eventUrl}>{eventFullTitle}</a>;
      return {
        course: course.name,
        event: eventTitle,
        newParticipant: <strong>{newParticipant.getDisplayName()}</strong>,
        companionsOfNewParticipant:
          event.participants?.find((p) => p.user === newParticipant._id)?.companions || 0,
        subject,
        participantsCount: event.numberOfParticipants(),
        email: <span style={{ color: "blue" }}>{PrivateSettings.siteEmail}</span>,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <RsvpTeam {...props} />,
  };
}
