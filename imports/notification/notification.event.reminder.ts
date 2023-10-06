import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { Spacebars } from "meteor/spacebars";

import { Log } from "/imports/api/log/log";
import { UserModel } from "/imports/api/users/users";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import { i18n } from "/imports/startup/both/i18next";
import * as StringTools from "/imports/utils/string-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { LocalTime } from "/imports/utils/local-time";

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

export function Model(entry: { body: Body }) {
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

    vars(userLocale: string, actualRecipient: UserModel, unsubToken: string) {
      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }

      const subjectvars = {
        EVENT: StringTools.truncate(event.title, 50),
        lng: userLocale,
      };
      const subject = i18n(
        "notification.event.reminder.mail.subject",
        "Reminder: {EVENT}",
        subjectvars,
      );

      // Show dates in local time and in users locale
      const regionZone = LocalTime.zone(event.region);

      const startMoment = regionZone.at(event.start);
      startMoment.locale(userLocale);

      const endMoment = regionZone.at(event.end);
      endMoment.locale(userLocale);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const { venue } = event;
      let venueLine: string | undefined;
      if (venue) {
        venueLine = [venue.name, venue.address].filter(Boolean).join(", ");
      }

      const vars = {
        companions:
          event.participants?.filter((p) => p.user === actualRecipient._id)[0].companions || 0,
        unsubLink: Router.url("profileNotificationsUnsubscribe", { token: unsubToken }),
        event,
        eventDate: startMoment.format("LL"),
        eventStart: startMoment.format("LT"),
        eventEnd: endMoment.format("LT"),
        venueLine,
        eventLink: Router.url("showEvent", event, { query: "campaign=eventReminder" }),
        unregisterToEventLink: Router.url("showEvent", event, {
          query: "action=unregister&campaign=eventReminder",
        }),
        calLink: Router.url("calEvent", event, { query: "campaign=eventReminder" }),
        subject,
        customSiteUrl: `${Meteor.absoluteUrl()}?campaign=eventReminder`,
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        eventTitle: "",
        eventCalendar: startMoment.calendar(),
      };

      const eventUrl = Router.url("showEvent", event, {
        query: "campaign=eventReminder",
      });

      vars.eventTitle = Spacebars.SafeString(`<a href="${eventUrl}">${event.title}</a>`);

      return vars;
    },
    template: "notificationEventReminderEmail",
  };
}
