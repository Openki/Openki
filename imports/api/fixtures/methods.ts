import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";
import { Events } from "/imports/api/events/events";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";
import { Users } from "/imports/api/users/users";

import * as HtmlTools from "/imports/utils/html-tools";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { venues } from "./data/venue.fixtures";

import { create as coursesCreate } from "./courses/create";
import { create as eventsCreate } from "./events/create";
import { create as groupsCreate } from "./groups/create";
import { generate as eventsGenerate } from "./events/generate";
import { create as infoPagesCreate } from "./infoPages/create";
import { regionsCreate } from "./regions/create";

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

function usersCreate() {
  ensure.user("greg", undefined, true);
  ensure.user("Seee", undefined, true);
  ensure.user("1u", undefined, true);
  ensure.user("validated_mail", undefined, true);
  return "Inserted user fixtures.";
}

function venuesCreate() {
  const prng = Prng("loadLocations");

  const testRegions = [
    Regions.findOne("9JyFCoKWkxnf8LWPh"),
    Regions.findOne("EZqQLGL4PtFCxCNrp"),
  ].map((r) => {
    if (!r) {
      throw new Error("Unexpected undefined");
    }
    return r._id;
  });

  venues.forEach((v) => {
    const venueData = { ...v };
    venueData.region = prng() > 0.85 ? testRegions[0] : testRegions[1];

    const venue = ensure.venue(venueData.name, venueData.region);

    _.extend(venue, venueData);

    venue.createdby = ensure.user(venue.createdby, venueData.region)._id;

    Venues.update(venue._id, venue);
  });

  return `Inserted ${venues.length} venue fixtures.`;
}

function commentsGenerate() {
  const prng = Prng("createComments");
  let count = 0;

  const userCount = Users.find().count();
  Courses.find().forEach((course) => {
    const createCount = Math.floor((prng() * 2) ** 4);
    const courseMembers = course.members.length;
    let { description } = course;
    if (!description) description = "No description"; // :-(
    const words = description.split(" ");

    for (let n = 0; n < createCount; n += 1) {
      const comment = {} as Mongo.OptionalId<CourseDiscussionEnity>;
      comment.courseId = course._id;
      comment.title = _.sample(words, 1 + Math.floor(prng() * 3)).join(" ");
      comment.text = HtmlTools.saneHtml(
        _.sample(words, 5).join(" ") + _.sample(words, Math.floor(prng() * 30)).join(" "),
      );

      comment.time_created = sometimesAfter(course.time_created);
      comment.time_updated =
        prng() < 0.9 ? comment.time_created : sometimesAfter(comment.time_created);

      if (!courseMembers || prng() < 0.2) {
        // Leave some anonymous comments
        if (prng() < 0.7) {
          const user = Users.findOne({}, { skip: Math.floor(prng() * userCount) });
          if (!user) {
            throw new Error("Unexpected undefined");
          }
          comment.userId = user._id;
        }
      } else {
        const commenter = course.members[Math.floor(prng() * courseMembers)];
        comment.userId = commenter.user;
      }

      CourseDiscussions.insert(comment);
    }

    count += createCount;
  });

  return `Generated ${count} course comments.`;
}

// Unfortunately we can't make this a debugOnly package because the integration
// tests use the data too, and they run with the --production flag.
// This guard is here until we find a better solution.
if (Meteor.isServer && PrivateSettings.testdata) {
  Meteor.methods({
    "fixtures.clean"() {
      Groups.remove({});
      Events.remove({});
      Venues.remove({});
      Courses.remove({});
    },

    async "fixtures.create"() {
      infoPagesCreate();
      if (Regions.find().count() === 0) {
        regionsCreate();
      }
      usersCreate();
      groupsCreate();
      venuesCreate();
      await coursesCreate();
      eventsGenerate();
    },
    "fixtures.infoPages.create": infoPagesCreate,
    "fixtures.users.create": usersCreate,
    "fixtures.regions.create": regionsCreate,
    "fixtures.groups.create": groupsCreate,
    "fixtures.events.create": eventsCreate,
    "fixtures.venues.create": venuesCreate,
    "fixtures.courses.create": coursesCreate,
    "fixtures.events.generate": eventsGenerate,
    "fixtures.comments.generate": commentsGenerate,
  });
}
