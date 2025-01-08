import { Courses } from "/imports/api/courses/courses";

export async function update() {
  let updated = 0;

  for (const orginalCourse of await Courses.find({ interested: { $exists: false } }).fetchAsync()) {
    const course = { ...orginalCourse };
    course.interested = course.members?.length || 0;
    // eslint-disable-next-line no-await-in-loop
    updated += await Courses.updateAsync(course._id, course);
  }

  return updated;
}
