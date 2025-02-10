import { Meteor } from "meteor/meteor";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { updateDbCacheFieldsServerOnly } from "./updateDbCacheFieldsServerOnly";

export const updateDbCacheFields = ServerMethod(
  "dbUtilities.updateDbCacheFields",
  async () => {
    if (!(await Meteor.userAsync())?.privileged("admin") && !PrivateSettings.testdata) {
      throw new Meteor.Error(401, "not permitted");
    }

    await updateDbCacheFieldsServerOnly();
  },
  { simulation: false },
);
