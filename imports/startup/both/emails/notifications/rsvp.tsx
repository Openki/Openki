import React from "react";
import { Router } from "meteor/iron:router";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";

import { Events } from "/imports/api/events/events";
import { Log } from "/imports/api/log/log";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Users, UserModel } from "/imports/api/users/users";

import { Model as NotificationModel } from "../notification";
import { Rsvp, Props } from "../../../../emails/notifications/Rsvp";
import { getSiteName } from "/imports/utils/getSiteName";
import { getStartEndDate } from "./utils";

interface Body {
  eventId: string;
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
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participant = Users.findOne(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  const body: Body = {
    eventId: event._id,
    participantId: participant._id,
    companions,
    recipients: [participant._id],
    model: "Rsvp",
  };

  Log.record("Notification.Send", [event._id, participant._id], body);
}

export function Model(entry: { body: Body }): NotificationModel<Props> {
  const { body } = entry;
  const event = Events.findOne(body.eventId);
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
      const campaign = "rsvpNotify";

      if (!newParticipant) {
        throw new Error("New participant does not exist (0.o)");
      }
      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      const { startMoment } = getStartEndDate(event, locale);

      const subjectvars = {
        TITLE: event.title.substring(0, 30),
        DATE: startMoment.format("LL"),
      };

      const subject = t(
        "notification.rsvp.mail.subject",
        "Confirmation {DATE} {TITLE}",
        subjectvars,
      );

      const siteName = getSiteName(region);
      const emailLogo = region.custom?.emailLogo;

      return {
        companions: body.companions,
        event,
        eventDate: startMoment.format("dddd, LL"),
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Rsvp {...props} />,
  };
}
