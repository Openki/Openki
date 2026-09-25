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
import { getStartEndDate } from "../utils/getStartEndDate";
import * as StringTools from "/imports/utils/string-tools";
import moment from "moment";

import ical, { ICalCalendarMethod } from "ical-generator";
import { convertToIcal } from "/imports/utils/convertToIcal";

export const ModelName = "Rsvp";

export interface Body {
  eventId: string;
  participantId: string;
  recipients: string[];
  model: typeof ModelName;
}

export async function record(eventId: string, participantId: string) {
  check(eventId, String);
  check(participantId, String);

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participant = await Users.findOneAsync(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  const body: Body = {
    eventId: event._id,
    participantId: participant._id,
    recipients: [participant._id],
    model: ModelName,
  };

  await Log.record("Notification.Send", [event._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const event = await Events.findOneAsync(body.eventId);
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

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
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

      const { startMoment, tz } = await getStartEndDate(event, locale);

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

      const calendar = ical({ name: "Openki Calendar", method: ICalCalendarMethod.PUBLISH });
      calendar.createEvent(convertToIcal(event));
      const content = calendar.toString();

      const sName = StringTools.slug(event.title);
      const sDate = moment(event.start).format("YYYY-MM-DD");

      const icalEvent = {
        method: calendar.method() || undefined,
        content,
        filename: `openki-${sName}-${sDate}.ics`,
      };

      return {
        companions:
          event.participants?.find((p) => p.user === actualRecipient._id)?.companions || 0,
        event,
        tz,
        unregisterToEventLink: Router.url("showEvent", event, {
          query: {
            action: "unregister",
            participant: actualRecipient._id,
            token: event.participants?.find((p) => p.user === actualRecipient._id)?.removeToken,
            campaign,
          },
        }),
        eventDate: startMoment.format("dddd, LL"),
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
        icalEvent,
      };
    },
    template: (props) => <Rsvp {...props} />,
  };
}
