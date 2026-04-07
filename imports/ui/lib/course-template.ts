import { Session } from "meteor/session";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import type { Props as GroupEditProps } from "/imports/ui/components/courses/edit";

export function GroupTemplate(): Partial<GroupEditProps> {
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
