import { Role, RoleType, SystemRoles } from "/imports/api/groups/lib/Role";

export function sameRole(role1: Role, role2: Role) {
  return role1.id === role2.id && role1.type === role2.type;
}

export function isTeam(role: Role): role is typeof SystemRoles.Team {
  return sameRole(role, SystemRoles.Team);
}

export function isParticipant(role: Role): role is typeof SystemRoles.Participant {
  return sameRole(role, SystemRoles.Participant);
}

export function isMentor(role: Role): role is typeof SystemRoles.Mentor {
  return sameRole(role, SystemRoles.Mentor);
}

export function isPredefined(role: { type: string }): role is { type: typeof RoleType.Predefined } {
  return role.type === RoleType.Predefined;
}

export function isCustom(role: { type: string }): role is { type: typeof RoleType.Custom } {
  return role.type === RoleType.Custom;
}
