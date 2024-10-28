import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PrivateSettings, PrivateSettingsPattern } from "/imports/utils/PrivateSettings";
import { PublicSettings, PublicSettingsPattern } from "/imports/utils/PublicSettings";

export const checkSettings = ServerMethod(
  "checkSettings",
  () => {
    const errors: Meteor.Error[] = [];
    try {
      // Check that everything is set as expected in the settings.
      check(PrivateSettings, PrivateSettingsPattern, { throwAllErrors: true });
    } catch (e) {
      errors.push(...e);
    }
    try {
      // Check that everything is set as expected in the settings.
      check(PublicSettings, PublicSettingsPattern, { throwAllErrors: true });
    } catch (e) {
      errors.push(...e);
    }
    // to comment out a setting we use "_commented" at the end of the name, so we can filter out this errors
    return errors.filter((e) => !e.message.includes("_commented"));
  },
  { simulation: false },
);
