/** DB-Model */
export interface RoleEntity {
  /** (name of role) */
  type: string;
  /** ex: "fa-solid fa-bullhorn" */
  icon: string;
  /** A role appears as "proposed only" */
  proposal?: boolean;

  /** This role is always added on creation. */
  preset?: boolean;
  /** This role is editable after creation. */
  editable?: boolean;
}

export const Roles: readonly RoleEntity[] = [
  {
    type: "participant",
    icon: "fa-solid fa-thumbs-up",
    proposal: false,

    preset: true,
    editable: false,
  },
  {
    type: "mentor",
    icon: "fa-solid fa-graduation-cap",
    proposal: true,

    preset: false,
    editable: true,
  },
  {
    type: "host",
    icon: "fa-solid fa-house",
    proposal: true,

    preset: false,
    editable: true,
  },
  {
    type: "team",
    icon: "fa-solid fa-bullhorn",
    proposal: false,

    preset: true,
    editable: false,
  },
];

export function getRole(type: string) {
  const role = Roles.find((r) => r.type === type);

  if (!role) {
    throw new Error(`Unknown role type: ${type}`);
  }

  return role;
}
