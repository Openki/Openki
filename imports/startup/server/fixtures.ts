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

if (runBackgroundTasks && Meteor.isServer && PrivateSettings.testdata) {
  const logResult = (error: unknown, result: unknown) => {
    if (error) {
      throw error;
    }
    /* eslint-disable-next-line no-console */
    console.log(result);
  };

  const ifCollectionEmpty = async <
    T extends {
      [key: string]: any;
    },
    U,
  >(
    collection: Mongo.Collection<T, U>,
    methods: string[],
  ) => {
    if ((await collection.find().countAsync()) === 0) {
      for (const method of methods) {
        await Meteor.callAsync(method, logResult);
      }
    }
  };

  Meteor.startup(async () => {
    // Remove the rate-limiting to allow the tests repeated logins
    Accounts.removeDefaultRateLimit();

    await ifCollectionEmpty(InfoPages, ["fixtures.infoPages.create"]);
    await ifCollectionEmpty(Users, ["fixtures.users.create"]);
    await ifCollectionEmpty(Regions, ["fixtures.regions.create"]);
    await ifCollectionEmpty(Groups, ["fixtures.groups.create"]);
    await ifCollectionEmpty(Venues, ["fixtures.venues.create"]);
    await ifCollectionEmpty(Courses, ["fixtures.courses.create"]);
    await ifCollectionEmpty(Events, ["fixtures.events.create", "fixtures.events.generate"]);
    await ifCollectionEmpty(CourseDiscussions, ["fixtures.comments.generate"]);
  });
}
