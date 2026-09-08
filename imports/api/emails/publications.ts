import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { Log } from "/imports/api/log/log";
import { type LogEntity } from "/imports/api/log/factory";

export type DirectMessage = Pick<LogEntity, "_id" | "ts" | "rel"> & {
  body: {
    message: string;
    sender: string;
    context?: { group?: string; event?: string };
  };
};

export const [directMessagesWithUser, useDirectMessagesWithUser] = ServerPublishMany(
  "directMessagesWithUser",
  // @ts-expect-error TODO: Make sure the returned type can be inferred from the projection
  async (otherUserId: string) => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    check(otherUserId, String);

    const query = {
      tr: "Notification.Send",
      rel: { $all: [otherUserId, userId] },
      "body.model": "PrivateMessage",
    };

    return Log.find(query, {
      sort: [["ts", "asc"]],
      projection: {
        // NOTE: `rel` is required so the client can find
        // the direct messages between the expected users.
        rel: 1,
        "body.context": 1,
        "body.message": 1,
        "body.sender": 1,
        ts: 1,
      },
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

    return Log.find(
      {
        rel: { $all: [otherUserId, userId] },
      },
      { sort: [["ts", "asc"]] },
    );
  },
);
