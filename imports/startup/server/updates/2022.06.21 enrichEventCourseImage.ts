import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

export function update() {
  let updated = 0;

  Courses.find({ image: { $exists: true } })
    .fetch()
    .forEach((course) => {
      updated += Events.update(
        { courseId: course._id },
        { $set: { courseImage: course.image } },
        { multi: true }
      );
    });

  return updated;
}
