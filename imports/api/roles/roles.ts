/** DB-Model */
export interface RoleEntity {
  /** (name of role) */
  type: string;
  /** ex: "fa-solid fa-bullhorn" */
  icon: string;
  /** For always-on roles */
  preset?: boolean;
  /** A role appears as "proposed only" */
  proposal?: boolean;
}

export const Roles: RoleEntity[] = [
  {
    type: "participant",
    icon: "fa-solid fa-thumbs-up",
    preset: true,
  },
  {
    type: "mentor",
    icon: "fa-solid fa-graduation-cap",
    proposal: true,
  },
  {
    type: "host",
    icon: "fa-solid fa-house",
    proposal: true,
  },
  {
    type: "team",
    icon: "fa-solid fa-bullhorn",
    preset: true,
  },
];

export function getRole(type: string) {
  return Roles.find((role) => role.type === type);
}
