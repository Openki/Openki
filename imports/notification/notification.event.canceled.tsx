import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";

import { Log } from "/imports/api/log/log";
import { UserModel } from "/imports/api/users/users";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import * as StringTools from "/imports/utils/string-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "./notification";
import { EventCanceled, Props } from "../emails/notifications/event.canceled";
import { getStartEndDate } from "./utils";

interface Body {
  sender: string;
  event: string;
  message: string;
  recipients: string[];
  model: string;
}

/**
 * Record the intent to send cancellation message
 * @param senderId id of the user that canceled the event
 * @param eventId id of the event that are canceld
 * @param message custom message
 */
export function record(senderId: string, eventId: string, message: string) {
  check(senderId, String);
  check(eventId, String);
  check(message, String);

  const recipients = [];

  const event = Events.findOne(eventId);
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
    model: "Event.Canceled",
  };

  Log.record("Notification.Send", [senderId, eventId, ...recipients], body);
}

export function Model(entry: { body: Body }): NotificationModel<Props> {
  const { body } = entry;
  const event = Events.findOne(body.event);

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

    vars(locale, _actualRecipient, unsubToken) {
      const t = i18next.getFixedT(locale);

      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      const subjectvars = {
        EVENT: StringTools.truncate(event.title, 50),
      };
      const subject = t(
        "notification.event.canceled.mail.subject",
        "Canceled: {EVENT}",
        subjectvars,
      );

      const { startMoment } = getStartEndDate(event, locale);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const vars = {
        unsubLink: Router.url("profileNotificationsUnsubscribe", { token: unsubToken }),
        event,
        subject,
        customSiteUrl: `${Meteor.absoluteUrl()}?campaign=eventCanceled`,
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        eventTitle: undefined as React.JSX.Element | undefined,
        message: entry.body.message,
        campaign: "eventCanceled",
      };

      const eventFullTitle = t("notification.event.canceled.mail.title", "{DATE} — {EVENT}", {
        EVENT: event.title,
        DATE: startMoment.calendar(),
      });
      const eventUrl = Router.url("showEvent", event, {
        query: "campaign=eventCanceled",
      });

      vars.eventTitle = <a href={eventUrl}>{eventFullTitle}</a>;

      return vars;
    },
    template: (props) => <EventCanceled {...props} />,
  };
}
