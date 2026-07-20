import { check } from "meteor/check";

import { Organizations, FindFilter } from "./organizations";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [details, useDetails] = ServerPublishOne(
  "organization",
  (organizationId: string) => {
    check(organizationId, String);

    return Organizations.find(organizationId);
  },
  (organizationId) => Organizations.findOne(organizationId),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Organizations.findFilter",
  (filter: FindFilter = {}, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Organizations.findFilter(filter, limit, skip, sort),
);
