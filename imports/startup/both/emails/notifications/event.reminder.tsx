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
import { EventReminder, Props } from "/imports/emails/notifications/EventReminder";
import { getStartEndDate } from "../utils/getStartEndDate";

export const ModelName = "Event.Reminder";

export interface Body {
  event: string;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send reminder message
 * @param eventId id of the event that are reminder
 * @param message custom message
 */
export async function record(eventId: string) {
  check(eventId, String);

  const recipients = [];

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participants = event.participants?.map((p) => p.user) || [];

  recipients.push(...participants);

  const body: Body = {
    event: eventId,
    recipients,
    model: ModelName,
  };

  await Log.record("Notification.Send", [eventId, ...recipients], body);
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

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventReminder";

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
        "notification.event.reminder.mail.subject",
        "Reminder: {EVENT}",
        subjectvars,
      );

      const { startMoment, tz } = await getStartEndDate(event, locale);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const vars = {
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
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        eventTitle: undefined as JSX.Element | undefined,
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
