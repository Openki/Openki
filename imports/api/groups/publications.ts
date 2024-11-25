import { check } from "meteor/check";

import { Groups, FindFilter } from "/imports/api/groups/groups";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Groups.findFilter",
  (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Groups.findFilter(filter as any, limit, skip, sort),
);

export const [details, useDetails] = ServerPublishOne(
  "group",
  (groupId: string) => {
    check(groupId, String);

    return Groups.find(groupId);
  },
  (groupId) => Groups.findOne(groupId),
);
