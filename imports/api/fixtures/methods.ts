import { Meteor } from "meteor/meteor";

import { Courses } from "/imports/api/courses/courses";

import { Events } from "/imports/api/events/events";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";

import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { create as coursesCreate } from "./courses/create";
import { create as eventsCreate } from "./events/create";
import { generate as eventsGenerate } from "./events/generate";
import { create as groupsCreate } from "./groups/create";
import { create as infoPagesCreate } from "./infoPages/create";
import { create as regionsCreate } from "./regions/create";
import { create as venueCreate } from "./venues/create";
import { generate as commentsGenerate } from "./comments/generate";

function usersCreate() {
  ensure.user("greg", undefined, true);
  ensure.user("Seee", undefined, true);
  ensure.user("1u", undefined, true);
  ensure.user("validated_mail", undefined, true);
  return "Inserted user fixtures.";
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
      venueCreate();
      await coursesCreate();
      eventsGenerate();
    },
    "fixtures.infoPages.create": infoPagesCreate,
    "fixtures.users.create": usersCreate,
    "fixtures.regions.create": regionsCreate,
    "fixtures.groups.create": groupsCreate,
    "fixtures.events.create": eventsCreate,
    "fixtures.venues.create": venueCreate,
    "fixtures.courses.create": coursesCreate,
    "fixtures.events.generate": eventsGenerate,
    "fixtures.comments.generate": commentsGenerate,
  });
}
