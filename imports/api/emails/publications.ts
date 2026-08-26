import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { visibleTenantsAsync, visibleTenants } from "/imports/utils/visible-tenants";
import { Log } from "/imports/api/log/log";

export const [directMessagesWithUser, useDirectMessagesWithUser] = ServerPublishMany(
  "directMessagesWithUser",
  async (otherUserId: string) => {
    const userId = Meteor.userId();
    check(userId, String);
    check(otherUserId, String);

    // TODO: Once the real data is returned as expected, this needs to return data in a different format
    // so we don't expose sensitive information to the client.
    // This means we need to transform each returned entry and can not simply return log entries as they are.
    return Log.find(
      {
        // TODO: Make sure this does not include other notification emails, but only the actual direct messages
        // TODO: Make sure the context is included so we know which group the message was sent from.
        tr: "Notification.SendResult",
        rel: { $all: [otherUserId, userId] },
        body: { recipient: otherUserId },
        tenant: { $in: await visibleTenantsAsync() },
      },
      { sort: [["ts", "asc"]] },
    );
  },
  // TODO: Update this to match the server logic so it stays in sync with the server publisher.
  (otherUserId) => {
    const userId = Meteor.userId();
    check(userId, String);
    check(otherUserId, String);

    return Log.find(
      {
        tr: "Notification.SendResult",
        rel: { $all: [otherUserId, userId] },
        body: { recipient: otherUserId },
        tenant: { $in: visibleTenants() },
      },
      { sort: [["ts", "asc"]] },
    );
  },
);
