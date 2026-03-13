import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { EventEntity, Events } from "/imports/api/events/events";
 import { RegionEntity, Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion } as RegionEntity & {
      featuredGroup?: RegionEntity["featuredOrganization"];
    };

    if (region.featuredGroup) {
      region.featuredOrganization = region.featuredGroup;
    }
    delete region.featuredGroup;

    updated += await Regions.updateAsync(region._id, region);
  }

  for (const originalEvent of await Events.find().fetchAsync()) {
    const event = { ...originalEvent } as EventEntity & {
      groups?: EventEntity["organizations"];
    };

    if (event.groups) {
      event.organizations = event.groups;
    }
    delete event.groups;

    updated += await Events.updateAsync(event._id, event);
  }

  for (const originalCourse of await Courses.find().fetchAsync()) {
    const course = { ...originalCourse } as CourseEntity & {
      groups?: CourseEntity["organizations"];
    };

    if (course.groups) {
      course.organizations = course.groups;
    }
    delete course.groups;

    updated += await Courses.updateAsync(course._id, course);
  }

  return updated;
}
