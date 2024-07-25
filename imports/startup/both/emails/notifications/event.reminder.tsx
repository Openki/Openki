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
import { Model as NotificationModel } from "../notification";
import { EventReminder, Props } from "../../../../emails/notifications/EventReminder";
import { getStartEndDate } from "./utils";

interface Body {
  event: string;
  recipients: string[];
  model: string;
}

/**
 * Record the intent to send reminder message
 * @param eventId id of the event that are reminder
 * @param message custom message
 */
export function record(eventId: string) {
  check(eventId, String);

  const recipients = [];

  const event = Events.findOne(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participants = event.participants?.map((p) => p.user) || [];

  recipients.push(...participants);

  const body: Body = {
    event: eventId,
    recipients,
    model: "Event.Reminder",
  };

  Log.record("Notification.Send", [eventId, ...recipients], body);
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

    vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventReminder";

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
        "notification.event.reminder.mail.subject",
        "Reminder: {EVENT}",
        subjectvars,
      );

      const { startMoment } = getStartEndDate(event, locale);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const vars = {
        companions:
          event.participants?.filter((p) => p.user === actualRecipient._id)[0].companions || 0,
        event,
        unregisterToEventLink: Router.url("showEvent", event, {
          query: { action: "unregister", campaign },
        }),
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        eventTitle: undefined as React.JSX.Element | undefined,
        eventCalendar: startMoment.calendar(),
        unsubscribe: { type: "automatedNotifications" as const, token: unsubToken },
        campaign,
      };

      const eventUrl = Router.url("showEvent", event, {
        query: { campaign },
      });

      vars.eventTitle = <a href={eventUrl}>{event.title}</a>;

      return vars;
    },
    template: (props) => <EventReminder {...props} />,
  };
}
