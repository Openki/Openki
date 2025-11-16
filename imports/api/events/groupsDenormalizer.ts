import { Mongo } from "meteor/mongo";
import union from "lodash/union";

import { Courses } from "../courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

/**
 * Update the group-related fields of events matching the selector
 */
export async function updateGroups(eventIdOrSelector: string | Mongo.Selector<EventEntity>) {
  for (const event of await Events.find(eventIdOrSelector).fetchAsync()) {
    // Any groups listed as organizers are allowed to edit.
    let editors = event.groupOrganizers.slice(); // Clone

    // If an event has a parent course, it inherits all groups and all editors from it.
    let courseGroups: string[] = [];
    if (event.courseId) {
      const course = await Courses.findOneAsync(event.courseId);
      if (!course) {
        throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
      }

      courseGroups = course.groups;
      editors = union(editors, course.editors);
    } else {
      editors.push(event.createdBy);
    }

    const update: Partial<EventEntity> = {
      editors,
    };

    // The course groups are only inherited if the event lies in the future
    // Past events keep their list of groups even if it changes for the course
    const historical = event.start < new Date();
    if (historical) {
      update.allGroups = union(event.groups, event.courseGroups);
    } else {
      update.courseGroups = courseGroups;
      update.allGroups = union(event.groups, courseGroups);
    }

    Events.updateAsync({ _id: event._id }, { $set: update });
  }
}
