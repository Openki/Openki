import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Props as GroupEditRoleProps, Role } from "/imports/ui/components/groups/edit/Role";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";

interface Props {
  value: Record<
    RoleEntity["type"],
    {
      enabled: boolean;
      enroll: boolean;
    }
  >;

  defaultRoles?: RoleEntity["type"][] | undefined;

  defaultUsersRoles?: RoleEntity["type"][] | undefined;

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

      if (isNewGroup && disabledCreateRoles.includes(role.type)) {
        return false;
      }

      return true;
    });
  }

  function isRoleEnabled(role: RoleEntity) {
    if (defaultRoles) {
      return defaultRoles.includes(role.type);
    } else if (isNewGroup) {
      const regionRole = regionRoles.find((regionRole) => regionRole.type === role.type);
      return regionRole?.preset ?? false;
    }
    return false;
  }
  function groupEditRolesAttr(): Pick<
    GroupEditRoleProps,
    "type" | "enabled" | "enroll" | "onRole" | "onEnroll"
  >[] {
    return Object.entries(value).map(([type, role]) => {
      return {
        type,
        ...role,
        onRole(checked: boolean) {
          const newRoles = { ...value };
          newRoles[type] = {
            ...role,
            enabled: checked,
          };
          onChange(newRoles);
        },
        onEnroll(checked: boolean) {
          const newRoles = { ...value };
          newRoles[type] = {
            ...role,
            enroll: checked,
          };
          onChange(newRoles);
        },
      };
    });
  }

  function getRoleIcon(type: RoleEntity["type"]) {
    const role = regionRoles.find((role) => role.type === type);
    if (!role) {
      throw new Error(`Missing role "${type}" for regionId ${selectedRegion}`);
    }

    return role.icon;
  }

  useEffect(() => {
    onChange(
      Object.fromEntries(
        availableRoles().map((role) => [
          role.type,
          {
            enabled: isRoleEnabled(role),
            enroll: defaultUsersRoles?.includes(role.type) ?? false,
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
            key={groupEditRoleAttr.type}
            {...groupEditRoleAttr}
            description={roleDescription(groupEditRoleAttr.type)}
            subscribeLabel={roleSubscribe(groupEditRoleAttr.type)}
            icon={getRoleIcon(groupEditRoleAttr.type)}
          />
        ))}
      </div>
    )
  );
}
