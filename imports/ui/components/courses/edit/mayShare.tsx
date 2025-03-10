import { CourseModel } from "/imports/api/courses/courses";

export function mayShare(course: CourseModel) {
  if (course.isPrivate()) {
    return false;
  }

  // only show share a course if there is a role to subscribe
  if (
    !(
      course.roles.some((r) => r !== "team") ||
      (course.roles.includes("team") && !course.members.some((m) => m.roles.includes("team")))
    )
  ) {
    return false;
  }

  return true;
}
