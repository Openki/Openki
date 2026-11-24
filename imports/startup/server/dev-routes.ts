import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import { createAuthMiddleware } from "meteor/accounts-express";

import { NotEmptyString } from "/imports/utils/CustomChecks";
import { GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";
import { Users, type UserEntity } from "/imports/api/users/users";

if (!Meteor.isDevelopment) {
  throw new Error("Dev only routes");
}

// HACK: This TEST ONLY route is needed because we run all Cypress tests from the client side
// where we can not make direct DB queries to reset the DB before each test suite runs.
// Using a Meteor Method ended up causing weird errors, so using Express HTTP handler was a simpler solution
WebApp.handlers.use(
  "/_test_only/group-chat-messages/reset/:groupId/:roleId",
  createAuthMiddleware({ required: true }),
  async (req, res) => {
    const user = (await Users.findOneAsync((req as typeof req & { userId: string }).userId, {
      projection: { privileges: 1 },
    })) as undefined | Pick<UserEntity, "privileges">;

    if (!user || !user.privileges?.includes("admin")) {
      throw new Meteor.Error(403, "Admin permission required");
    }

    const { groupId, roleId } = req.params;

    check(groupId, NotEmptyString());
    check(roleId, NotEmptyString());

    await GroupChatMessages.removeAsync({ groupId, roleId });

    res.sendStatus(200);
  },
);
