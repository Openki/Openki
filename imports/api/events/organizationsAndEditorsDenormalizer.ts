import { Mongo } from "meteor/mongo";
import { union } from "lodash-es";

import { Groups } from "../groups/groups";
import { Events, EventEntity } from "/imports/api/events/events";

/**
 * Update the organization-related fields of events matching the selector
 */
export async function updateOrganizationsAndEditors(
  eventIdOrSelector: string | Mongo.Selector<EventEntity>,
) {
  for (const event of await Events.find(eventIdOrSelector).fetchAsync()) {
    // Any organizations listed as team are allowed to edit.
    let editors = event.teamOrganizations.slice(); // Clone

    // If an event has a parent group, it inherits all organizations and all editors from it.
    let groupOrganizations: string[] = [];
    if (event.courseId) {
      const group = await Groups.findOneAsync(event.courseId);
      if (!group) {
        throw new Error(`Missing group ${event.courseId} for event ${event._id}`);
      }

      groupOrganizations = group.organizations;
      editors = union(editors, group.editors);
    } else {
      editors.push(event.createdBy);
    }

    const update: Partial<EventEntity> = {
      editors,
    };

    // The group organizations are only inherited if the event lies in the future
    // Past events keep their list of organizations even if it changes for the group
    const historical = event.start < new Date();
    if (historical) {
      update.allOrganizations = union(event.organizations, event.courseOrganizations);
    } else {
      update.courseOrganizations = groupOrganizations;
      update.allOrganizations = union(event.organizations, groupOrganizations);
    }

    Events.updateAsync({ _id: event._id }, { $set: update });
  }
}
