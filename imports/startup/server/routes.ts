import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import type { ServerResponse } from "node:http";

import * as Profile from "/imports/utils/profile";
import type { UserEntity } from "/imports/api/users/users";

// Server only routes

Router.route("profileNotificationsUnsubscribe", {
  path: "/profile/notifications/unsubscribe/:token",
  async action() {
    const unsubToken = this.params.token as string;

    const accepted = await Profile.Notifications.unsubscribe(unsubToken);

    const query: { unsubscribed?: string; "unsubscribe-error"?: string } = {};
    if (accepted) {
      query.unsubscribed = "notifications";
    } else {
      query["unsubscribe-error"] = "";
    }

    this.response.writeHead(302, {
      Location: Router.url("profile", {}, { query }),
    });

    this.response.end();
  },
  where: "server",
});

Router.route("profilePrivateMessagesUnsubscribe", {
  path: "/profile/privatemessages/unsubscribe/:token",
  async action() {
    const unsubToken = this.params.token as string;

    const accepted = await Profile.PrivateMessages.unsubscribe(unsubToken);

    const query: { unsubscribed?: string; "unsubscribe-error"?: string } = {};
    if (accepted) {
      query.unsubscribed = "privatemessages";
    } else {
      query["unsubscribe-error"] = "";
    }

    this.response.writeHead(302, {
      Location: Router.url("profile", {}, { query }),
    });

    this.response.end();
  },
  where: "server",
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
    const { WebApp } = await import("meteor/webapp");
    const { check } = await import("meteor/check");
    const { createAuthMiddleware } = await import("meteor/accounts-express");

    const { NotEmptyString } = await import("/imports/utils/CustomChecks");
    const { GroupChatMessages } =
      await import("/imports/api/group-chat-messages/group-chat-messages");

    WebApp.handlers.use(
      "/_test_only/group-chat-messages/reset/:groupId/:roleId",
      createAuthMiddleware({ required: true }),
      (_req: any, _res: any, next: any) =>
        Promise.resolve(
          (async (req: any, res: ServerResponse) => {
            const user = (await Meteor.users.findOneAsync(req.userId, {
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
