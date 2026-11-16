import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";

import { FindFilter } from "/imports/api/log/factory";
import { Log } from "/imports/api/log/log";

import { ServerPublishMany } from "/imports/utils/ServerPublish";

export const [findFilter, useFindFilter] = ServerPublishMany(
  "log",
  async (filter: FindFilter, limit: number) => {
    check(limit, Match.Integer);
    const user = await Meteor.userAsync();

    if (!user || !user.hasPrivilege("admin")) {
      throw new Meteor.Error(401, "not permitted");
    }

    return Log.findFilter(filter, limit);
  },
  (filter, limit) => {
    check(limit, Match.Integer);
    const user = Meteor.user();

    if (!user || !user.hasPrivilege("admin")) {
      return Log.findFilter({}, 0);
    }

    return Log.findFilter(filter, limit);
  },
);
