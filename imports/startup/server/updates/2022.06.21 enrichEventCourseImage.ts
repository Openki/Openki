import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

export async function update() {
  let updated = 0;

  for (const course of await Courses.find({ image: { $exists: true } }).fetchAsync()) {
    // eslint-disable-next-line no-await-in-loop
    updated += await Events.updateAsync(
      { courseId: course._id },
      { $set: { courseImage: course.image } },
      { multi: true },
    );
  }

  return updated;
}
