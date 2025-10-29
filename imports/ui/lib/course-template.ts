import { Session } from "meteor/session";

import type { Props as CourseEditProps } from "/imports/ui/components/courses/edit";

export function CourseTemplate(): Partial<CourseEditProps> {
  return {
    roles: ["host", "mentor"],
    region: Session.get("region"),
  };
}
