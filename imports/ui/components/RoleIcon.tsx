import React from "react";

import { useRegionRoles } from "../lib/useRegionRoles";
import { RegionEntity, RoleEntity } from "/imports/api/regions/regions";

export function RoleIcon({
  type,
  regionId,
}: {
  type: RoleEntity["type"];
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, roles] = useRegionRoles(regionId);

  if (isLoading()) {
    return null;
  }
  const role = roles.find((r) => r.type === type);

  if (!role) {
    return null;
  }

  return <i className={`${role.icon} fa-fw`} />;
}
