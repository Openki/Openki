import { Version } from "/imports/api/version/version";

import { ServerPublishMany, ServerPublishOne } from "meteor/server-publish";

export const [details, useDetails] = ServerPublishOne(
  "version.details",
  () => Version.find(),
  () => Version.findOne(),
);
export const [all, useAll] = ServerPublishMany("version", () => Version.find());
