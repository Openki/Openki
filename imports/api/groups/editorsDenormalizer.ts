import { Mongo } from "meteor/mongo";

import { GroupEntity, Groups } from "./groups";
import * as eventOrganizationsAndEditorsDenormalizer from "../events/organizationsAndEditorsDenormalizer";
import { SystemRoles } from "/imports/api/groups/lib/Role";

/**
 * Recalculate the editors field
 */
export async function updateEditors(groupIdOrSelector: string | Mongo.Selector<GroupEntity>) {
  for (const group of await Groups.find(groupIdOrSelector).fetchAsync()) {
    const editors = group.teamOrganizations.slice();

    editors.push(...group.membersWithRole(SystemRoles.Team).map((m) => m.user));

    const update = { $set: { editors } };

    await Groups.updateAsync({ _id: group._id }, update);

    // At some point we'll have to figure out a proper caching hierarchy

    await eventOrganizationsAndEditorsDenormalizer.updateOrganizationsAndEditors({
      groupId: group._id,
    });
  }
}
