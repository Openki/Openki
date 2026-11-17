import { check } from "meteor/check";

import { GroupDiscussions } from "./group-discussions";

import { ServerPublishMany } from "meteor/server-publish";

export const [forGroup, useForGroup] = ServerPublishMany("discussion", (groupId: string) => {
  check(groupId, String);

  return GroupDiscussions.find({ groupId });
});
