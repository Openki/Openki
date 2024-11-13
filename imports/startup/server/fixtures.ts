import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Accounts } from "meteor/accounts-base";

import "/imports/api/fixtures/methods";
import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";
import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";
import { Users } from "/imports/api/users/users";
import { InfoPages } from "/imports/api/infoPages/infoPages";

import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

async function ifCollectionEmpty<
  T extends {
    [key: string]: any;
  },
  U,
>(collection: Mongo.Collection<T, U>, methods: string[]) {
  if ((await collection.countDocuments()) === 0) {
    for (const method of methods) {
      // eslint-disable-next-line no-await-in-loop
      const result = await Meteor.callAsync(method);
      /* eslint-disable-next-line no-console */
      console.log(result);
    }
  }
}

if (runBackgroundTasks && Meteor.isServer && PrivateSettings.testdata) {
  Meteor.startup(async () => {
    // Remove the rate-limiting to allow the tests repeated logins
    Accounts.removeDefaultRateLimit();

    await ifCollectionEmpty(InfoPages, ["fixtures.infoPages.create"]);
    await ifCollectionEmpty(Regions, ["fixtures.regions.create"]);
    await ifCollectionEmpty(Users, ["fixtures.users.create"]);
    await ifCollectionEmpty(Groups, ["fixtures.groups.create"]);
    await ifCollectionEmpty(Venues, ["fixtures.venues.create"]);
    await ifCollectionEmpty(Courses, ["fixtures.courses.create"]);
    await ifCollectionEmpty(Events, ["fixtures.events.create", "fixtures.events.generate"]);
    await ifCollectionEmpty(CourseDiscussions, ["fixtures.comments.generate"]);
  });
}
