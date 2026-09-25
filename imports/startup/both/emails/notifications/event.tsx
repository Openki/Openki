import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { uniq } from "lodash-es";

import { GroupModel, Groups } from "/imports/api/groups/groups";
import { Events } from "/imports/api/events/events";
import { Log } from "/imports/api/log/log";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { UserModel } from "/imports/api/users/users";

import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { Event, Props } from "../../../../emails/notifications/Event";
import { getStartEndDate } from "../utils/getStartEndDate";
import { Organizations } from "/imports/api/organizations/organizations";
import { SystemRoles } from "/imports/api/groups/lib/Role";

export const ModelName = "Event";

export interface Body {
  isNew: boolean;
  eventId: string;
  replicats: string[];
  additionalMessage: string | undefined;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send event notifications
 * @param eventId event id to announce
 * @param isNew whether the event is a new one
 * @param additionalMessage custom message
 */
export async function record(
  eventId: string,
  isNew: boolean,
  replicats: string[],
  additionalMessage?: string | undefined,
) {
  check(eventId, String);
  check(isNew, Boolean);
  check(replicats, [String]);
  check(additionalMessage, Match.Optional(String));

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  // What do we do when we receive an event which is not attached to a group?
  // For now when we don't have a group we just go through the motions but
  // the recipient list will be empty.
  let group: GroupModel | undefined;
  if (event.groupId) {
    group = await Groups.findOneAsync(event.groupId);
  }

  const body: Body = {
    isNew,
    eventId: event._id,
    replicats,
    additionalMessage,

    // The list of recipients is built right away so that only group members
    // at the time of event creation will get the notice even if sending is
    // delayed.
    // The notification is sent to all members of the group and on a event change to all participants
    recipients: uniq([...(group?.members || []), ...(event.participants || [])])?.map(
      (p) => p.user,
    ),
    model: ModelName,
  };

  await Log.record("Notification.Send", group ? [group._id] : [], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const event = await Events.findOneAsync(entry.body.eventId);

  let group: GroupModel | undefined;
  if (event?.groupId) {
    group = await Groups.findOneAsync(event.groupId);
  }

  let region: RegionModel | undefined;
  if (event?.region) {
    region = await Regions.findOneAsync(event.region);
  }

  let registrationClosed = false;
  if (event) {
    const organizations = await Organizations.find({
      _id: { $in: event.allTeamOrganizations() },
    }).fetchAsync();
    registrationClosed = organizations.some((org) => org.registrationClosed);
  }

  const replicas = await Events.find({ _id: { $in: entry.body.replicats } }).fetchAsync();

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventNotify";

      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }
      if (!region) {
        throw new Error("Region does not exist (0.o)");
      }
      if (replicas.length !== entry.body.replicats.length) {
        throw new Error("Not all replicas found (0.o)");
      }

      const { startMoment, tz } = await getStartEndDate(event, locale);

      const subjectvars = {
        TITLE: event.title.substring(0, 30),
        DATE: startMoment.format("LL"),
      };

      let subject;
      if (entry.body.isNew) {
        subject = t("notification.event.mail.subject.new", "Fixed {DATE}: {TITLE}", subjectvars);
      } else {
        subject = t(
          "notification.event.mail.subject.changed",
          "{DATE} changed: {TITLE}",
          subjectvars,
        );
      }

      const siteName = getSiteName(region);
      const emailLogo = region.custom?.emailLogo;

      const groupLink = Router.url("showGroup", group, { query: { campaign } });
      return {
        event,
        tz,
        recipientTakePart: event.participants?.some((p) => p.user === actualRecipient._id),
        registrationClosed,
        registerToEventLink: Router.url("showEvent", event, {
          query: { action: "register", campaign },
        }),
        group: <a href={groupLink}>{group.name}</a>,
        groupName: group.name,
        unsubscribeFromGroupLink: Router.url("showGroup", group, {
          query: { unsubscribe: SystemRoles.Participant.id, force: 1, campaign },
        }),
        isNew: entry.body.isNew,
        replicas,
        subject,
        additionalMessage: entry.body.additionalMessage,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Event {...props} />,
  };
}
