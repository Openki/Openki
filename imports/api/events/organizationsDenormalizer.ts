import { Mongo } from "meteor/mongo";
import { union } from "lodash-es";

import { Courses } from "../courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

/**
 * Update the organization-related fields of events matching the selector
 */
export async function updateOrganizations(eventIdOrSelector: string | Mongo.Selector<EventEntity>) {
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

      courseOrganizations = course.groups;
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
      update.allGroups = union(event.groups, event.courseGroups);
    } else {
      update.courseGroups = courseOrganizations;
      update.allGroups = union(event.groups, courseOrganizations);
    }

    Events.updateAsync({ _id: event._id }, { $set: update });
  }
}
