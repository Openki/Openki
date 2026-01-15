import { Mongo } from "meteor/mongo";

import { Groups } from "/imports/api/groups/groups";
import { UserEntity, Users } from "/imports/api/users/users";

/**
 * Recalculate the groups and badges field
 */
export async function updateGroupsAndBadges(userIdOrSelector: string | Mongo.Selector<UserEntity>) {
  await Promise.all(
    await Users.find(userIdOrSelector).mapAsync(async (user) => {
      const groups = await Groups.find({ "members.user": user._id }).mapAsync((group) => group._id);

      const badges = groups.slice();
      badges.push(user._id);

      const update = {
        $set: {
          groups,
          badges,
        },
      };

      await Users.updateAsync({ _id: user._id }, update);
    }),
  );
}
