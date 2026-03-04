import { Mongo } from "meteor/mongo";

import { Organizations } from "../organizations/organizations";
import { UserEntity, Users } from "/imports/api/users/users";

/**
 * Recalculate the organizations and badges field
 */
export async function updateOrganizationsAndBadges(
  userIdOrSelector: string | Mongo.Selector<UserEntity>,
) {
  await Promise.all(
    await Users.find(userIdOrSelector).mapAsync(async (user) => {
      const organizations = await Organizations.find({ "members.user": user._id }).mapAsync(
        (organization) => organization._id,
      );

      const badges = organizations.slice();
      badges.push(user._id);

      const update = {
        $set: {
          groups: organizations,
          badges,
        },
      };

      await Users.updateAsync({ _id: user._id }, update);
    }),
  );
}
