import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";

import * as Profile from "/imports/utils/profile";
import { NotEmptyString } from "/imports/utils/CustomChecks";
import { GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";

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

// HACK: This TEST ONLY route is needed because we run all Cypress tests from the client side.
// where we can not make direct DB queries.
// Using a Meteor Method ended up causing weird errors, so a simple HTTP request should be enough
if (Meteor.isDevelopment) {
  Router.route("TEST_ONLY_groupChatMessages_deleteAllForGroupAndRole", {
    path: "/_test_only/group-chat-messages/reset/:groupId/:roleId",
    async action() {
      // TODO: We need to access the user token somehow.
      // IDEA: Maybe make this into a WebApp endpoint instead? Important to only allow admin users to delete data.
      const user = await Meteor.userAsync();
      if (!user || !user.hasPrivilege("admin")) {
        throw new Meteor.Error(403, "Admin permission required");
      }

      check(this.params.groupId, NotEmptyString());
      check(this.params.roleId, NotEmptyString());

      const groupId = this.params.groupId;
      const roleId = this.params.roleId;

      console.dir({ DELETING_MESSAGES_FOR: { groupId, roleId } });

      await GroupChatMessages.removeAsync({ groupId, roleId });

      this.response.writeHead(200);
      this.response.end();
    },
    where: "server",
  });
}
