import React, { JSX } from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { chain, truncate } from "lodash-es";

import { Groups } from "/imports/api/groups/groups";
import { Organizations } from "/imports/api/organizations/organizations";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { Users, UserModel } from "/imports/api/users/users";
import { Model as NotificationModel } from "../notification";
import { OrganizationGroup, Props } from "../../../../emails/notifications/OrganizationGroup";

import { getSiteName } from "/imports/utils/getSiteName";
import { ReactJoin } from "/imports/utils/ReactJoin";

export interface Body {
  groupId: string;
  recipients: string[];
  model: "Organization.group";
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

  const recipients = chain(
    await Organizations.find({ _id: { $in: group.teamOrganizations } }).mapAsync((o) => o.members),
  )
    .flatten()
    .filter((m) => m.notify)
    .map((m) => m.user)
    .uniq()
    .value();

  const body: Body = {
    groupId: group._id,

    // Don't send to creator
    recipients: recipients.filter((r) => r !== group.createdby),
    model: "Organization.group",
  };

  await Log.record("Notification.Send", [group._id], body);
}

export async function Model({ body }: { body: Body }): Promise<NotificationModel<Props>> {
  const group = await Groups.findOneAsync(body.groupId);
  if (!group) {
    throw new Error("Group does not exist (0.o)");
  }
  const organizations = await Organizations.find({
    _id: { $in: group.teamOrganizations },
  }).fetchAsync();
  if (!(organizations.length > 0)) {
    throw new Error("Organizations does not exist (0.o)");
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

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "organizationGroupNotify";

      const recipientsOrganizations = organizations.filter(({ members }) =>
        members.some(({ user }) => user === actualRecipient._id),
      );

      const subjectvars = {
        GROUP: truncate(group.name, { length: 10 }),
        ORGANIZATIONS: truncate(recipientsOrganizations.map(({ short }) => short).join(", "), {
          length: 30,
        }),
      };

      const subject = t(
        "notification.organization.group.mail.subject",
        "{GROUP} proposed in {ORGANIZATIONS}",
        subjectvars,
      );

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const groupLink = Router.url("showGroup", group, { query: { campaign } });
      return {
        group: <a href={groupLink}>{group.name}</a>,
        groupDescription: group.description || "",
        organizations: ReactJoin(
          recipientsOrganizations.map((organization) => (
            <a
              key={organization._id}
              href={Router.url("organizationDetails", organization, {
                query: { campaign },
              })}
            >
              {organization.name}
            </a>
          )),
          <>&quot;, &quot;</>,
        ) as JSX.Element,
        creator,
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <OrganizationGroup {...props} />,
  };
}
