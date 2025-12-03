import { Session } from "meteor/session";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import type { Props as CourseEditProps } from "/imports/ui/components/courses/edit";

export function CourseTemplate(): Partial<CourseEditProps> {
  const currentRegion = CleanedRegion(Session.get("region"));

  if (currentRegion) {
    return {
      roles: ["host", "mentor"],
      region: currentRegion,
    };
  }

  return {
    roles: ["host", "mentor"],
  };
}
