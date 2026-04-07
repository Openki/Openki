import { Mongo } from "meteor/mongo";
import { union } from "lodash-es";

import { Groups } from "../courses/courses";
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
      const course = await Groups.findOneAsync(event.courseId);
      if (!course) {
        throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
      }

      groupOrganizations = course.organizations;
      editors = union(editors, course.editors);
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
