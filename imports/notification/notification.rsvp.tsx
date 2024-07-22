import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";

import { Events } from "/imports/api/events/events";
import { Log } from "/imports/api/log/log";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Users, UserModel } from "/imports/api/users/users";

import { LocalTime } from "/imports/utils/local-time";
import { getSiteName } from "/imports/utils/getSiteName";

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

export function Model(entry: { body: Body }) {
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

    vars(userLocale: string, _actualRecipient: UserModel, unsubToken: string) {
      if (!newParticipant) {
        throw new Error("New participant does not exist (0.o)");
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
      startMoment.locale(userLocale);

      const endMoment = regionZone.at(event.end);
      endMoment.locale(userLocale);

      const subjectvars = {
        TITLE: event.title.substring(0, 30),
        DATE: startMoment.format("LL"),
        lng: userLocale,
      };

      const subject = i18n(
        "notification.rsvp.mail.subject",
        "Confirmation {DATE} {TITLE}",
        subjectvars,
      );

      const { venue } = event;
      let venueLine: string | undefined;
      if (venue) {
        venueLine = [venue.name, venue.address].filter(Boolean).join(", ");
      }

      const siteName = getSiteName(region);
      const emailLogo = region.custom?.emailLogo;

      return {
        companions: body.companions,
        unsubLink: Router.url("profileNotificationsUnsubscribe", { token: unsubToken }),
        event,
        eventDate: startMoment.format("dddd, LL"),
        eventStart: startMoment.format("LT"),
        eventEnd: endMoment.format("LT"),
        venueLine,
        eventLink: Router.url("showEvent", event, { query: "campaign=rsvpNotify" }),
        calLink: Router.url("calEvent", event, { query: "campaign=rsvpNotify" }),
        subject,
        customSiteUrl: `${Meteor.absoluteUrl()}?campaign=rsvpNotify`,
        customSiteName: siteName,
        customEmailLogo: emailLogo,
      };
    },
    template: "notificationRsvpEmail",
  };
}
