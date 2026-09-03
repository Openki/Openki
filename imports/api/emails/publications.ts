import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { Log } from "/imports/api/log/log";
import { type LogEntity } from "/imports/api/log/factory";

export type DirectMessage = Pick<LogEntity, "_id" | "ts"> & {
  body: {
    message: string;
    sender: string;
    targetRecipient: string;
    context?: { group?: string; event?: string };
  };
};

export const [directMessagesWithUser, useDirectMessagesWithUser] = ServerPublishMany(
  "directMessagesWithUser",
  // @ts-expect-error Not sure how to solve this type error, but it needs to be fixed if we use this solution
  async (otherUserId: string) => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    check(otherUserId, String);

    console.dir({ GET_MESSAGES: true, otherUserId, userId });
    const query = {
      tr: "Notification.Send",
      rel: { $all: [otherUserId, userId] },
      "body.model": "PrivateMessage",
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
      projection: {
        // _id: 1,
        body: 1,
        ts: 1,
      },
      // transform: ({ _id, body, ts }) => {
      //   // TODO: Why is this transform not run at all?
      //   console.dir({ SERVER_TRANSFORM: true, _id, body, ts });
      //   return { _id, body, ts };
      // },
    }) as
      | Mongo.Cursor<DirectMessage, DirectMessage>
      | Promise<Mongo.Cursor<DirectMessage, DirectMessage>>;
  },
  (otherUserId) => {
    const userId = Meteor.userId();
    if (!userId) {
      return Log.findFilter({}, 0);
    }

    check(otherUserId, String);

    const query = {
      tr: "Notification.Send",
      rel: { $all: [otherUserId, userId] },
      "body.model": "PrivateMessage",
    };

    const items = Log.find(query, { sort: ["ts", "asc"], reactive: false }).fetch();

    // TODO: Has the client received the log items via the WS connection at this point?
    // If so, why does the Log return an empty query result?
    // If not, why does the Log collection not refresh once the items have been received?
    console.dir({ CLIENT_LOG: true, items });
    debugger;

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
      // transform: ({ _id, body, ts, ...rest }) => {
      //   // NOTE: Why are client transforms run but not the server transforms?
      //   // NOTE: Why are client transforms no longer running when the server projections have been enabled?
      //   console.dir({ CLIENT_TRANSFORM: true, _id, body, ts, rest });
      //   return { _id, body, ts } as DirectMessage;
      // },
    }) as Mongo.Cursor<DirectMessage>;
  },
);
