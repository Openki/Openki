import { check } from "meteor/check";

import { Groups } from "/imports/api/groups/groups";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";

export const [findFilter, useFindFilter] = ServerPublishMany("Groups.findFilter", (filter) =>
  Groups.findFilter(filter)
);

export const [details, useDetails] = ServerPublishOne(
  "group",
  (groupId: string) => {
    check(groupId, String);

    return Groups.find(groupId);
  },
  (groupId: string) => Groups.findOne(groupId)
);
