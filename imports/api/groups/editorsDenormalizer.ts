import { Mongo } from "meteor/mongo";

import { GroupEntity, Groups } from "./groups";
import * as eventOrganizationsAndEditorsDenormalizer from "../events/organizationsAndEditorsDenormalizer";

/**
 * Recalculate the editors field
 */
export async function updateEditors(groupIdOrSelector: string | Mongo.Selector<GroupEntity>) {
  for (const group of await Groups.find(groupIdOrSelector).fetchAsync()) {
    const editors = group.teamOrganizations.slice();

    group.members.forEach((member) => {
      if (member.roles.includes("team")) {
        editors.push(member.user);
      }
    });

    const update = { $set: { editors } };

    await Groups.updateAsync({ _id: group._id }, update);

    // At some point we'll have to figure out a proper caching hierarchy

    await eventOrganizationsAndEditorsDenormalizer.updateOrganizationsAndEditors({
      groupId: group._id,
    });
  }
}
