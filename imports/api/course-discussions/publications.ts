import { check } from "meteor/check";

import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";

import { ServerPublishMany } from "/imports/utils/ServerPublish";

export const [forCourse, useForCourse] = ServerPublishMany("discussion", (courseId: string) => {
  check(courseId, String);

  return CourseDiscussions.find({ courseId });
});
