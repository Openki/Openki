import { Meteor } from "meteor/meteor";

import { Users } from "/imports/api/users/users";

import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks)
  Meteor.startup(async () => {
    await Promise.all(
      PrivateSettings.admins.map(async (username) => {
        const user = await Users.findOneAsync({ username });
        if (user) {
          await Users.updateAsync({ _id: user._id }, { $addToSet: { privileges: "admin" } });
        }
      }),
    );
  });
