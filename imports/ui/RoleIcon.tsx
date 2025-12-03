import React from "react";

import { getRole } from "../api/roles/roles";

export function RoleIcon({ type }: { type: string }) {
  return <i className={`${getRole(type).icon} fa-fw`} />;
}
