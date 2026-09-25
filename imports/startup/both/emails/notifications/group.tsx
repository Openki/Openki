import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate } from "lodash-es";

import { Groups } from "/imports/api/groups/groups";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { Users, UserModel } from "/imports/api/users/users";
import { Model as NotificationModel } from "../notification";
import { Group, Props } from "../../../../emails/notifications/Group";

import { getSiteName } from "/imports/utils/getSiteName";

export const ModelName = "Group";

export interface Body {
  groupId: string;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send join notifications
 * @param groupId ID for the GroupDiscussions collection
 */
export async function record(groupId: string) {
  check(groupId, String);

  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${groupId}`);
  }

  const body: Body = {
    groupId: group._id,
    recipients: [group.createdby],
    model: ModelName,
  };

  await Log.record("Notification.Send", [group._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const group = await Groups.findOneAsync(body.groupId);
  if (!group) {
    throw new Error("Group does not exist (0.o)");
  }

  const creator = await Users.findOneAsync(group.createdby);
  if (!creator) {
    throw new Error("Creator does not exist (0.o)");
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, _actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "groupNotify";

      const subjectvars = {
        GROUP: truncate(group.name, { length: 10 }),
      };

      const subject = t("notification.group.mail.subject", "Your proposed {GROUP}", subjectvars);

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const groupLink = Router.url("showGroup", group, { query: { campaign } });
      return {
        group: <a href={groupLink}>{group.name}</a>,
        groupLink,
        groupDescription: group.description || "",
        creator,
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Group {...props} />,
  };
}
