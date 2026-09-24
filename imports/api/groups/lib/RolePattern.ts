import { RoleType } from "/imports/api/groups/lib/Role";
import { StringEnum } from "/imports/utils/CustomChecks";

export const RolePattern = {
  id: String,
  type: StringEnum(...Object.values(RoleType)),
};
