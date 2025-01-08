import { check } from "meteor/check";
import { SafeString, UnsafeString } from "/imports/utils/CustomChecks";

import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";

import { ServerPublishMany } from "/imports/utils/ServerPublish";

export const [forCourse, useForCourse] = ServerPublishMany(
  "discussion",
  (courseId: UnsafeString) => {
    check(courseId, SafeString());

    return CourseDiscussions.find({ courseId });
  },
);
