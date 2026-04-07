import { check } from "meteor/check";

import { GroupDiscussions } from "/imports/api/course-discussions/course-discussions";

import { ServerPublishMany } from "/imports/utils/ServerPublish";

export const [forGroup, useForGroup] = ServerPublishMany("discussion", (groupId: string) => {
  check(groupId, String);

  return GroupDiscussions.find({ courseId: groupId });
});
