import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks && Meteor.isServer && PrivateSettings.testdata) {
  Meteor.startup(async () => {
    // Remove the rate-limiting to allow the tests repeated logins
    Accounts.removeDefaultRateLimit();

    const { serverOnlyCreateFixtures } = await import("/imports/api/fixtures/methods");

    // In this context, we can use the private method and bypass the requirement that
    // an admin user has to be signed in to call the Meteor method for resetting fixture data.
    await serverOnlyCreateFixtures();
  });
}
