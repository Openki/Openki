/* eslint-disable no-await-in-loop */
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";
import { Prng } from "/imports/api/fixtures/Prng";
import { Users } from "/imports/api/users/users";

import * as HtmlTools from "/imports/utils/html-tools";
import { Log } from "../../log/log";

/**
 * Select a date that is after the given date
 * For past dates a date between the original date and the present is chosen,
 * dates closer to the original date preferred.
 * For future dates, a date between the original date and double the time between now and then
 * is chosen.
 */
function sometimesAfter(date: Date) {
  const prng = Prng("sometimesAfter");

  // Seconds between then and now
  const spread = new Date(Math.abs(new Date().getTime() - date.getTime())).getTime();

  // Quadratic dropoff: Place new date closer to the original date statistically
  const placement = prng();
  const squaredPlacement = placement * placement;

  return new Date(date.getTime() + spread * squaredPlacement);
}

export async function generate() {
  const prng = Prng("createComments");
  let count = 0;

  const userCount = await Users.countDocuments();
  for (const course of await Courses.find().fetchAsync()) {
    const createCount = Math.floor((prng() * 2) ** 4);
    const courseMembers = course.members.length;
    let { description } = course;
    if (!description) description = "No description"; // :-(
    const words = description.split(" ");

    for (let n = 0; n < createCount; n += 1) {
      const comment = {} as Mongo.OptionalId<CourseDiscussionEnity>;
      comment.courseId = course._id;
      comment.title = _.sample(words, 1 + Math.floor(prng() * 3)).join(" ");
      comment.text = HtmlTools.sanitizeHtml(
        _.sample(words, 5).join(" ") + _.sample(words, Math.floor(prng() * 30)).join(" "),
      );

      comment.time_created = sometimesAfter(course.time_created);
      comment.time_updated =
        prng() < 0.9 ? comment.time_created : sometimesAfter(comment.time_created);

      if (!courseMembers || prng() < 0.2) {
        // Leave some anonymous comments
        if (prng() < 0.7) {
          const user = await Users.findOneAsync({}, { skip: Math.floor(prng() * userCount) });
          if (!user) {
            throw new Error("Unexpected undefined");
          }
          comment.userId = user._id;
        }
      } else {
        const commenter = course.members[Math.floor(prng() * courseMembers)];
        comment.userId = commenter.user;
      }

      await CourseDiscussions.insertAsync(comment);
    }

    count += createCount;
  }

  Log.record("testdata", ["CourseDiscussions"], `Generated ${count} course comments.`);
}
