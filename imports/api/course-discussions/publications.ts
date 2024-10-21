import { check } from "meteor/check";
import { SafeString } from "/imports/utils/CustomChecks";

import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";

import { ServerPublishMany } from "/imports/utils/ServerPublish";

export const [forCourse, useForCourse] = ServerPublishMany("discussion", (courseId: string) => {
  check(courseId, SafeString());

  return CourseDiscussions.find({ courseId });
});
