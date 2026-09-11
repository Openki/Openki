import { type RolePattern } from "/imports/api/groups/lib/RolePattern";
import { type Type } from "/imports/utils/CustomChecks";

export const RoleType = {
  Predefined: "predefined",
  Custom: "custom",
} as const;

export type Role = Type<typeof RolePattern>;

export const predefinedRole = <T extends string>(id: T) =>
  ({ id, type: RoleType.Predefined }) as const;

export const SystemRoles = {
  Team: predefinedRole("team"),
  Participant: predefinedRole("participant"),
  Mentor: predefinedRole("mentor"),
} as const;
