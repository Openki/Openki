import { Match, check } from "meteor/check";

import { FindFilter } from "/imports/api/log/factory";
import { Log } from "/imports/api/log/log";

import { ServerPublishMany } from "/imports/utils/ServerPublish";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";

export const [findFilter, useFindFilter] = ServerPublishMany(
  "log",
  (filter: FindFilter, limit: number) => {
    check(limit, Match.Integer);

    // Non-admins get an empty list
    if (!UserPrivilegeUtils.privileged(Meteor.userId(), "admin")) {
      return Log.findFilter({}, 0);
    }

    return Log.findFilter(filter, limit);
  }
);
