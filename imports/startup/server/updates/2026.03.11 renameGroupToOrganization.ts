import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { EventEntity, Events } from "/imports/api/events/events";
import { RegionEntity, Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion } as RegionEntity & {
      defaultTeamGroups?: RegionEntity["defaultTeamOrganizations"];
    };

    if (region.defaultTeamGroups) {
      region.defaultTeamOrganizations = region.defaultTeamGroups;
    }
    delete region.defaultTeamGroups;

    updated += await Regions.updateAsync(region._id, region);
  }

  for (const originalEvent of await Events.find().fetchAsync()) {
    const event = { ...originalEvent } as EventEntity & {
      groupOrganizers?: EventEntity["teamOrganizations"];
    };

    if (event.groupOrganizers) {
      event.teamOrganizations = event.groupOrganizers;
    }
    delete event.groupOrganizers;

    updated += await Events.updateAsync(event._id, event);
  }

  for (const originalCourse of await Courses.find().fetchAsync()) {
    const course = { ...originalCourse } as CourseEntity & {
      groupOrganizers?: CourseEntity["teamOrganizations"];
    };

    if (course.groupOrganizers) {
      course.teamOrganizations = course.groupOrganizers;
    }
    delete course.groupOrganizers;

    if (course.history) {
      course.history
        .filter((e) => e.type === "groupPromote")
        .forEach((e) => {
          e.type = "organizationPromote";
        });

      course.history
        .filter((e) => e.type === "groupOrga")
        .forEach((e) => {
          e.type = "organizationTeam";
        });
    }

    updated += await Courses.updateAsync(course._id, course);
  }

  return updated;
}
