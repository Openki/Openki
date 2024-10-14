import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

export function update() {
  let updated = 0;

  Courses.find({ image: { $exists: true } })
    .fetch()
    .forEach((course) => {
      updated += Courses.update({ _id: course._id }, { $set: { compactImage: course.image } });
      updated += Events.update(
        { courseId: course._id },
        { $set: { courseImage: course.image, courseCompactImage: course.image } },
        { multi: true },
      );
    });

  return updated;
}
