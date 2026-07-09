import React from "react";

import { RegionEntity } from "/imports/api/regions/regions";
import { RoleEntity } from "/imports/utils/PublicSettings";

import { useRegionRoles } from "../lib/useRegionRoles";
import { cx } from "/imports/utils/cx";

export function RoleIcon({
  className,
  type,
  regionId,
}: {
  className?: string | undefined;
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

  return <i className={cx(role.icon, "fa-fw", className)} />;
}
