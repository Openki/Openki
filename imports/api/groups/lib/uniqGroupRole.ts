import { groupBy } from "lodash-es";

import { type GroupRole, type GroupCustomRole } from "/imports/api/groups/groups";
import { RoleType } from "/imports/api/groups/lib/Role";

/**
 * predefined roles: are unique by id \
 * custom roles: are unique by trimmed case-insensitive label
 * @returns list with predefined and custom (with trimmed label) roles
 */
export function uniqGroupRole(roles: GroupRole[]) {
  return Object.values(
    groupBy(roles, (role) => {
      switch (role.type) {
        case RoleType.Predefined:
          return RoleType.Predefined + role.id;
        case RoleType.Custom:
          // For custom roles, compare the label (case-insensitive)
          return RoleType.Custom + role.label.trim().toUpperCase();
        default:
          throw new Error("Unknown value for role.type");
      }
    }),
  ).map((entries) => {
    // all predefined roles are same
    if (entries[0].type === RoleType.Predefined) {
      return entries[0];
    }
    // for custom role take that with a id, else the first (new custom role)
    const customRole = (entries.find((r) => r.id) || entries[0]) as GroupCustomRole;
    customRole.label = customRole.label.trim();
    return customRole;
  });
}
