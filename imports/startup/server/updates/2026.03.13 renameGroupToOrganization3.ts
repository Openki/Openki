import { Courses } from "/imports/api/courses/courses";

export async function update() {
  let updated = 0;

  for (const originalCourse of await Courses.find().fetchAsync()) {
    const course = { ...originalCourse };

    if (course.history) {
      course.history.forEach((e) => {
        if ("group" in e.data) {
          (e.data as any).organization = e.data.group;
          delete e.data.group;
        }
      });
      updated += await Courses.updateAsync(course._id, course);
    }
  }

  return updated;
}
