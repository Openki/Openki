import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Props as GroupEditRoleProps, Role } from "/imports/ui/components/groups/edit/Role";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";

interface Props {
  value: Record<
    RoleEntity["id"],
    {
      enabled: boolean;
      enroll: boolean;
    }
  >;

  defaultRoles?: RoleEntity["id"][] | undefined;

  defaultUsersRoles?: RoleEntity["id"][] | undefined;

  disabledCreateRoles: string[];

  selectedRegion: string;

  fullRoleSelection: boolean;

  onChange: (role: Props["value"]) => void;

  isNewGroup: boolean;
}

export function RoleSelect({
  value,
  defaultRoles,
  defaultUsersRoles,
  disabledCreateRoles,
  selectedRegion,
  fullRoleSelection,
  onChange,
  isNewGroup,
}: Props) {
  const { t } = useTranslation();

  const [isLoadingRegionRoles, regionRoles] = useRegionRoles(selectedRegion);

  const { roleDescription, roleSubscribe } = useRoleDisplay(regionRoles);

  function availableRoles() {
    if (isLoadingRegionRoles()) return [];

    return regionRoles.filter((role) => {
      // Skip non-editable, preset roles
      if (!role.editable && role.preset) {
        return false;
      }

      if (isNewGroup && disabledCreateRoles.includes(role.id)) {
        return false;
      }

      return true;
    });
  }

  function isRoleEnabled(role: RoleEntity) {
    if (defaultRoles) {
      return defaultRoles.includes(role.id);
    } else if (isNewGroup) {
      const regionRole = regionRoles.find((regionRole) => regionRole.id === role.id);
      return regionRole?.preset ?? false;
    }
    return false;
  }
  function groupEditRolesAttr(): Pick<
    GroupEditRoleProps,
    "id" | "enabled" | "enroll" | "onRole" | "onEnroll"
  >[] {
    return Object.entries(value).map(([id, role]) => {
      return {
        id,
        ...role,
        onRole(checked: boolean) {
          const newRoles = { ...value };
          newRoles[id] = {
            ...role,
            enabled: checked,
          };
          onChange(newRoles);
        },
        onEnroll(checked: boolean) {
          const newRoles = { ...value };
          newRoles[id] = {
            ...role,
            enroll: checked,
          };
          onChange(newRoles);
        },
      };
    });
  }

  function getRoleIcon(id: RoleEntity["id"]) {
    const role = regionRoles.find((role) => role.id === id);
    if (!role) {
      throw new Error(`Missing role "${id}" for regionId ${selectedRegion}`);
    }

    return role.icon;
  }

  useEffect(() => {
    onChange(
      Object.fromEntries(
        availableRoles().map((role) => [
          role.id,
          {
            enabled: isRoleEnabled(role),
            enroll: defaultUsersRoles?.includes(role.id) ?? false,
          },
        ]),
      ),
    );
  }, [isNewGroup, disabledCreateRoles, regionRoles]);

  if (isLoadingRegionRoles()) {
    return null;
  }

  return (
    fullRoleSelection &&
    availableRoles().length > 0 && (
      <div className="col-md">
        <div className="form-label">{t("group.edit.needs.role", "This group might need…")}</div>
        {groupEditRolesAttr().map((groupEditRoleAttr) => (
          <Role
            key={groupEditRoleAttr.id}
            {...groupEditRoleAttr}
            description={roleDescription(groupEditRoleAttr.id)}
            subscribeLabel={roleSubscribe(groupEditRoleAttr.id)}
            icon={getRoleIcon(groupEditRoleAttr.id)}
          />
        ))}
      </div>
    )
  );
}
