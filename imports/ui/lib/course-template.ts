import { Session } from "meteor/session";

import type { Data as CourseEditData } from "/imports/ui/components/courses/edit";

export function CourseTemplate(): Partial<CourseEditData> {
  return {
    roles: ["host", "mentor"],
    region: Session.get("region"),
  };
}
