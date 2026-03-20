import { Mongo } from "meteor/mongo";
import { union } from "lodash-es";

import { Courses } from "../courses/courses";
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

    // If an event has a parent course, it inherits all organizations and all editors from it.
    let courseOrganizations: string[] = [];
    if (event.courseId) {
      const course = await Courses.findOneAsync(event.courseId);
      if (!course) {
        throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
      }

      courseOrganizations = course.organizations;
      editors = union(editors, course.editors);
    } else {
      editors.push(event.createdBy);
    }

    const update: Partial<EventEntity> = {
      editors,
    };

    // The course organizations are only inherited if the event lies in the future
    // Past events keep their list of organizations even if it changes for the course
    const historical = event.start < new Date();
    if (historical) {
      update.allOrganizations = union(event.organizations, event.courseOrganizations);
    } else {
      update.courseOrganizations = courseOrganizations;
      update.allOrganizations = union(event.organizations, courseOrganizations);
    }

    Events.updateAsync({ _id: event._id }, { $set: update });
  }
}
