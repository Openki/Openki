// eslint-disable-next-line import/no-cycle
import { EventEntity, Events } from "/imports/api/events/events";
import { Courses } from "/imports/api/courses/courses";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
  let updated = 0;

  Courses.find({}, { fields: { _id: 1, categories: 1 } }).forEach((course) => {
    updated += Events.update(
      { courseId: course._id },
      { $set: { categories: course.categories || [] } },
      { multi: true }
    );
  });

  /* eslint-disable-next-line no-console */
  console.log(`events.categoriesDenormalizer.onStartUp: ${updated} affected events`);
}

export function beforeInsert(event: EventEntity): EventEntity {
  // categories comes from the parent course
  const course = Courses.findOne(event.courseId);
  if (!course) {
    throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
  }

  return { ...event, categories: course.categories };
}

export function afterCourseUpdateCategories(course: { _id: string; categories: string[] }) {
  Events.update(
    { courseId: course._id },
    { $set: { categories: course.categories } },
    { multi: true }
  );
}
