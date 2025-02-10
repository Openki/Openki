import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

import { create as fixturesCreate } from "/imports/api/fixtures/methods";

import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks && Meteor.isServer && PrivateSettings.testdata) {
  Meteor.startup(async () => {
    // Remove the rate-limiting to allow the tests repeated logins
    Accounts.removeDefaultRateLimit();

    fixturesCreate();
  });
}
