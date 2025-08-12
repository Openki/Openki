import { Courses } from "/imports/api/courses/courses";

export async function update() {
  let updated = 0;

  for (const orginalCourse of await Courses.find({ archived: { $exists: false } }).fetchAsync()) {
    const course = { ...orginalCourse };
    course.archived = false;

    updated += await Courses.updateAsync(course._id, course);
  }

  return updated;
}
