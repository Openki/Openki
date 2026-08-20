import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";

import { Groups } from "/imports/api/groups/groups";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";
import { Events } from "/imports/api/events/events";
import { Model as NotificationModel } from "../notification";
import { RsvpTeam, Props } from "../../../../emails/notifications/RsvpTeam";

import { getSiteName } from "/imports/utils/getSiteName";
import { LocalTime } from "/imports/utils/local-time";

export interface Body {
  eventId: string;
  groupId: string;
  participantId: string;
  recipients: string[];
  model: "Rsvp.Team";
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

  if (!event.groupId) {
    throw new Meteor.Error(`Event has no group`);
  }

  const group = await Groups.findOneAsync(event.groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${event.groupId}`);
  }

  const body: Body = {
    eventId: event._id,
    groupId: group._id,
    participantId: participant._id,

    // Don't send to new member, they know
    recipients: group
      .membersWithRole("team")
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: "Rsvp.Team",
  };

  await Log.record("Notification.Send", [group._id, event._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const event = await Events.findOneAsync(body.eventId);
  const group = await Groups.findOneAsync(body.groupId);
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
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }
      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      // Show dates in local time and in users locale
      const regionZone = await LocalTime.zoneAsync(event.region);

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
        group: group.name,
        event: eventTitle,
        newParticipant: <span className="fw-bold">{newParticipant.getDisplayName()}</span>,
        companionsOfNewParticipant:
          event.participants?.find((p) => p.user === newParticipant._id)?.companions || 0,
        subject,
        participantsCount: event.numberOfParticipants(), 
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
