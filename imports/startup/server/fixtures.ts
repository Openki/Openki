import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { PublicSettings } from "/imports/utils/PublicSettings";

if (runBackgroundTasks && Meteor.isServer && PublicSettings.testdata) {
  Meteor.startup(async () => {
    // Remove the rate-limiting to allow the tests repeated logins
    Accounts.removeDefaultRateLimit();

    const { createFixtures } = await import("/imports/api/fixtures/methods");

    await createFixtures();
  });
}
