import { StringEnum, Type } from "/imports/utils/CustomChecks";

export const RoleType = {
  Predefined: "predefined" as const,
  Custom: "custom" as const,
};

export const RolePattern = {
  id: String,
  type: StringEnum(...Object.values(RoleType)),
};

export type Role = Type<typeof RolePattern>;

export const predefinedRole = <T extends string>(id: T) =>
  ({ id, type: RoleType.Predefined }) as const;

export const SystemRoles = {
  Team: predefinedRole("team" as const),
  Participant: predefinedRole("participant" as const),
  Mentor: predefinedRole("mentor" as const),
} as const;
