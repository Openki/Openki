import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { Log } from "/imports/api/log/log";

export const [directMessagesWithUser, useDirectMessagesWithUser] = ServerPublishMany(
  "directMessagesWithUser",
  async (otherUserId: string) => {
    const userId = Meteor.userId();
    check(userId, String);
    check(otherUserId, String);

    console.dir({ GET_MESSAGES: true, otherUserId, userId });
    const query = {
      tr: "Notification.Send",
      rel: { $all: [otherUserId, userId] },
      "body.model": "PrivateMessage",
      "body.sender": userId,
      "body.targetRecipient": otherUserId,
    };
    console.dir(query);

    // TODO: Once the real data is returned as expected, this needs to return data in a different format
    // so we don't expose sensitive information to the client.
    // This means we need to transform each returned entry and can not simply return log entries as they are.
    return Log.find(query, {
      sort: [["ts", "asc"]],
      // TODO: Figure out why no data is returned when this projection is enabled.
      // NOTE: The projection works when running a single query via the MongoDB Compass GUI
      // IDEA: Maybe we can exclude fields using another method?
      // projection: {
      //   _id: 1,
      //   body: 1,
      //   ts: 1,
      // },
    });
  },
  (otherUserId) => {
    const userId = Meteor.userId();
    check(userId, String);
    check(otherUserId, String);

    const query = {
      tr: "Notification.Send",
      rel: { $all: [otherUserId, userId] },
      "body.model": "PrivateMessage",
      "body.sender": userId,
      "body.targetRecipient": otherUserId,
    };

    return Log.find(query, {
      sort: [["ts", "asc"]],
      // TODO: Figure out why no data is returned when this projection is enabled.
      // NOTE: The projection works when running a single query via the MongoDB Compass GUI
      // IDEA: Maybe we can exclude fields using another method?
      // projection: {
      //   _id: 1,
      //   body: 1,
      //   ts: 1,
      // },
    });
  },
);
