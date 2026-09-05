import React from "react";

import { RegionEntity } from "/imports/api/regions/regions";
import { RoleEntity } from "/imports/utils/PublicSettings";

import { useRegionRoles } from "../lib/useRegionRoles";
import { cx } from "/imports/utils/cx";
import { RoleType } from "/imports/api/groups/lib/Role";

export type Role =
  | { id: RoleEntity["id"]; type: typeof RoleType.Predefined }
  | { label: string; type: typeof RoleType.Custom };

export function RoleIcon({
  className,
  role,
  regionId,
}: {
  className?: string | undefined;
  role: Role;
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, roles] = useRegionRoles(regionId);

  switch (role.type) {
    case RoleType.Predefined: {
      if (isLoading()) {
        return null;
      }
      const regionRole = roles.find((r) => r.id === role.id);

      if (!regionRole) {
        return null;
      }

      return <i className={cx(regionRole.icon, "fa-fw", className)} />;
    }

    case RoleType.Custom:
      return <i className={cx("fa-fw", className)} />;

    default:
      throw new Error("Unexpected value for role.type");
  }
}
