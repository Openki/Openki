import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";

import * as Profile from "/imports/utils/profile";
import type { UserEntity } from "/imports/api/users/users";
import { StringEnum } from "/imports/utils/CustomChecks";

// Server only routes

function getProfileNotificationsUnsubscribeURL(type: NotificationType, accepted: boolean) {
  const url = new URL(Meteor.absoluteUrl("profile"));
  url.search = new URLSearchParams([
    accepted ? ["unsubscribed", type] : ["unsubscribe-error", ""],
  ]).toString();

  return url.toString();
}

/**
 * This defines both valid notification types (keys)
 * and their respective unsubscribe handlers.
 */
const notificationUnsubscribeHandlers = {
  notifications: Profile.Notifications.unsubscribe,
  privatemessages: Profile.PrivateMessages.unsubscribe,
};

export type NotificationType = keyof typeof notificationUnsubscribeHandlers;

/** Valid types of notifications that can be unsubscribed from */
const notificationTypes = Object.keys(notificationUnsubscribeHandlers) as NotificationType[];

WebApp.handlers.get("/profile/:notificationType/unsubscribe/:token", async (req, res) => {
  const { token, notificationType } = req.params;
  check(notificationType, StringEnum(...notificationTypes));

  const unsubscribeHandler = notificationUnsubscribeHandlers[notificationType];
  if (!unsubscribeHandler) {
    throw new Meteor.Error(400, `Unsupported notification type: ${notificationType}`);
  }

  const accepted = await unsubscribeHandler(token);

  res.redirect(302, getProfileNotificationsUnsubscribeURL(notificationType, accepted));
});

// HACK: This TEST ONLY route is needed because we run all Cypress tests from the client side
// where we can not make direct DB queries to reset the DB before each test suite runs.
// Using a Meteor Method ended up causing weird errors, so using Express HTTP handler was a simpler solution
if (Meteor.isDevelopment) {
  // oxlint-disable-next-line unicorn/consistent-function-scoping
  async function registerTestOnlyRoutes() {
    if (!Meteor.isDevelopment) {
      throw new Error("Test only routes");
    }
    const { createAuthMiddleware } = await import("meteor/accounts-express");

    const { NotEmptyString } = await import("/imports/utils/CustomChecks");
    const { GroupChatMessages } =
      await import("/imports/api/group-chat-messages/group-chat-messages");
    const { Users } = await import("/imports/api/users/users");

    WebApp.handlers.use(
      "/_test_only/group-chat-messages/reset/:groupId/:roleId",
      createAuthMiddleware({ required: true }),
      (_req: any, _res: any, next: any) =>
        Promise.resolve(
          (async (req: any, res: ServerResponse) => {
            const user = (await Users.findOneAsync(req.userId, {
              projection: { privileges: 1 },
            })) as undefined | Pick<UserEntity, "privileges">;

            if (!user || !user.privileges?.includes("admin")) {
              throw new Meteor.Error(403, "Admin permission required");
            }

            const { groupId, roleId } = req.params;

            // @ts-expect-error Ignoring this for now
            check(groupId, NotEmptyString());
            // @ts-expect-error Ignoring this for now
            check(roleId, NotEmptyString());

            await GroupChatMessages.removeAsync({ groupId, roleId });

            res.writeHead(200);
            res.end();
          })(_req, _res),
        ).catch(next),
    );
  }

  registerTestOnlyRoutes();
}
