import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import { Groups } from "/imports/api/groups/groups";
import { Users } from "/imports/api/users/users";

import * as AsyncTools from "/imports/utils/async-tools";

Meteor.methods({
  /**
   * Recalculate the groups and badges field
   */
  "user.updateBadges"(selector) {
    Users.find(selector).forEach((originalUser) => {
      const userId = originalUser._id;

      AsyncTools.untilClean((resolve, reject) => {
        const user = Users.findOne(userId);

        if (!user) {
          resolve(true);
          return;
        }

        const groups: string[] = [];
        Groups.find({ "members.user": user._id }).forEach((group) => {
          groups.push(group._id);
        });

        const badges = groups.slice();
        badges.push(user._id);

        const update = {
          $set: {
            groups,
            badges,
          },
        };

        Users.rawCollection().updateMany({ _id: user._id }, update, {}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result?.modifiedCount === 0);
          }
        });
      });
    });
  },
});
