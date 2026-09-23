import React, { JSX } from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate } from "lodash-es";

import { Log } from "/imports/api/log/log";
import { UserModel } from "/imports/api/users/users";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { EventCanceled, Props } from "/imports/emails/notifications/EventCanceled";
import { getStartEndDate } from "../utils/getStartEndDate";
import * as StringTools from "/imports/utils/string-tools";
import moment from "moment";

import ical, { ICalCalendarMethod } from "ical-generator";
import { convertToIcal } from "/imports/utils/convertToIcal";

export const ModelName = "Event.Canceled";

export interface Body {
  sender: string;
  event: string;
  message: string;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send cancellation message
 * @param senderId id of the user that canceled the event
 * @param eventId id of the event that are canceld
 * @param message custom message
 */
export async function record(senderId: string, eventId: string, message: string) {
  check(senderId, String);
  check(eventId, String);
  check(message, String);

  const recipients = [];

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participants = event.participants?.map((p) => p.user);

  if (!participants?.length) {
    throw new Meteor.Error(`Event ${eventId} has none participants.`);
  }

  recipients.push(...participants.filter((p) => p !== senderId));

  const body: Body = {
    event: eventId,
    sender: senderId,
    message,
    recipients,
    model: ModelName,
  };

  await Log.record("Notification.Send", [senderId, eventId, ...recipients], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const event = await Events.findOneAsync(body.event);

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

    async vars(locale, _actualRecipient, unsubToken) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventCanceled";

      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      const subjectvars = {
        EVENT: truncate(event.title, { length: 50 }),
      };
      const subject = t(
        "notification.event.canceled.mail.subject",
        "Canceled: {EVENT}",
        subjectvars,
      );

      const { startMoment, tz } = await getStartEndDate(event, locale);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const calendar = ical({ name: "Openki Calendar", method: ICalCalendarMethod.CANCEL });
      calendar.createEvent(convertToIcal(event));
      const content = calendar.toString();

      const sName = StringTools.slug(event.title);
      const sDate = moment(event.start).format("YYYY-MM-DD");

      const icalEvent = {
        method: calendar.method() || undefined,
        content,
        filename: `openki-${sName}-${sDate}.ics`,
      };

      const vars = {
        event,
        tz,
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        eventTitle: undefined as JSX.Element | undefined,
        message: entry.body.message,
        unsubscribe: { type: "automatedNotifications" as const, token: unsubToken },
        campaign,
        icalEvent,
      };

      const eventFullTitle = t("notification.event.canceled.mail.title", "{DATE} — {EVENT}", {
        EVENT: event.title,
        DATE: startMoment.calendar(),
      });
      const eventUrl = Router.url("showEvent", event, {
        query: { campaign },
      });

      vars.eventTitle = <a href={eventUrl}>{eventFullTitle}</a>;

      return vars;
    },
    template: (props) => <EventCanceled {...props} />,
  };
}
