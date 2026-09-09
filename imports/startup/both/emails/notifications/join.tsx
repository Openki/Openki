import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate } from "lodash-es";

import { Groups } from "/imports/api/groups/groups";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";

import * as HtmlTools from "/imports/utils/html-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { Join, Props } from "/imports/emails/notifications/Join";
import { getRoleDisplay } from "/imports/utils/getRoleDisplay";
import { loadRoles } from "/imports/api/regions/loadRoles";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { Role, RolePattern, SystemRoles } from "/imports/api/groups/lib/Role";
import { sameRole } from "/imports/api/groups/lib/isRole";

export const ModelName = "Join";

export interface Body {
  groupId: string;
  participantId: string;
  recipients: string[];
  newRole: Role;
  message: string | undefined;
  model: typeof ModelName;
}

/**
 * Record the intent to send join notifications
 * @param groupId ID for the GroupDiscussions collection
 * @param participantId ID of the user that joined
 * @param newRole new role of the participant
 * @param message Optional message of the new participant
 */
export async function record(
  groupId: string,
  participantId: string,
  newRole: Role,
  message?: string,
) {
  check(groupId, String);
  check(participantId, String);
  check(newRole, RolePattern);
  check(message, Match.Optional(String));

  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${groupId}`);
  }

  const participant = await Users.findOneAsync(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  const body: Body = {
    groupId: group._id,
    participantId: participant._id,
    newRole,
    message,

    // Don't send to new member, they know
    recipients: group
      .membersWithRole(SystemRoles.Team)
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: ModelName,
  };

  await Log.record("Notification.Send", [group._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const group = await Groups.findOneAsync(body.groupId);
  const newParticipant = await Users.findOneAsync(body.participantId);
  const recipients = await Users.find({
    _id: { $in: body.recipients.filter((r) => r !== body.participantId) },
    notifications: true,
  }).fetchAsync();

  let roles: RoleEntity[] | undefined;
  if (group?.region) {
    roles = await loadRoles(group?.region);
  }
  const groupRole = group?.roles?.find((r) => sameRole(r, body.newRole));

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(_locale: string, actualRecipient: UserModel, unsubToken: string) {
      const campaign = "joinNotify";

      if (!newParticipant) {
        throw new Error("New participant does not exist (0.o)");
      }
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }
      if (!roles) {
        throw new Error("Roles could not be loaded (0.o)");
      }
      if (!groupRole) {
        throw new Error("Role does not exist in group (0.o)");
      }

      const { roleShort, roleNotificationJoinEmailSubject, roleNotificationJoinEmailIntro } =
        getRoleDisplay(i18next, roles);

      const subject = roleNotificationJoinEmailSubject(groupRole, {
        GROUP: truncate(group.name, { length: 10 }),
        USER: truncate(newParticipant.getDisplayName(), { length: 50 }),
      });

      const roleCounts = group.roles.map((role) => ({
        role: roleShort(role),
        count: group.membersWithRole(role).length,
      }));

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const groupLink = Router.url("showGroup", group, { query: { campaign } });
      const groupName = <a href={groupLink}>{group.name}</a>;
      const roleIntroduction = roleNotificationJoinEmailIntro(groupRole, {
        USER: <span className="fw-bold">{newParticipant.getDisplayName()}</span>,
        GROUP: groupName,
      });
      return {
        group: groupName,
        roleIntroduction,
        subject,
        message: body.message ? HtmlTools.plainToHtml(body.message) : undefined,
        roleCounts,
        otherRecipients: recipients
          .filter((r) => r._id !== actualRecipient._id)
          .map((r) => r.getDisplayName())
          .join(", "),
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Join {...props} />,
  };
}
