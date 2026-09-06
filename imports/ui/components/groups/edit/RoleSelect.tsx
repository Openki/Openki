import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { GroupRole } from "/imports/api/groups/groups";
import { ReactSelectCreate } from "/imports/ui/components/react-select/ReactSelectCreate";
import { predefinedRole } from "/imports/api/groups/lib/Role";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import { OrganizationModel } from "/imports/api/organizations/organizations";
import { chain } from "lodash-es";
import { isRole } from "/imports/api/groups/lib/isRole";

interface Props {
  region: string;

  organizations: OrganizationModel[];

  value: GroupRole[] | undefined;

  isNewGroup: boolean;

  onChange: (role: Props["value"]) => void;
}

export function RoleSelect({
  region,
  organizations,
  value: outerValue,
  isNewGroup,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const [isLoadingRegionRoles, regionRoles] = useRegionRoles(region);

  const { roleShort, roleDescription } = useRoleDisplay(regionRoles);

  const disabledCreateRoles = useMemo(() => {
    return chain(organizations)
      .flatMap(({ disableCreateRoles }) => disableCreateRoles ?? [])
      .uniq()
      .value();
  }, [organizations]);

  function availableRoles() {
    if (isLoadingRegionRoles()) return [];

    return [
      ...regionRoles
        .filter((role) => {
          // Skip non-editable, preset roles
          if (!role.editable && role.preset) {
            return false;
          }

          if (isNewGroup && disabledCreateRoles.includes(role.id)) {
            return false;
          }

          return true;
        })
        .map((r) => predefinedRole(r.id)),
    ];
  }

  function isRoleEnabled(roleId: string) {
    if (isNewGroup) {
      const regionRole = regionRoles.find((regionRole) => regionRole.id === roleId);
      return regionRole?.preset ?? false;
    }
    return true;
  }

  if (isLoadingRegionRoles()) {
    return null;
  }

  /** on undefined initialize with the preset region roles */
  if (!outerValue) {
    onChange(availableRoles().filter((r) => isRoleEnabled(r.id)));
  }
  const value = outerValue || [];

  return (
    <div className="col-md">
      <div className="form-label">{t("group.edit.needs.role", "This group might need…")}</div>
      <ReactSelectCreate
        isMulti
        isClearable
        hideSelectedOptions
        options={availableRoles()
          .filter((r) => !value.some((v) => isRole(r, v)))
          .map((r) => ({
            value: r,
            label: (
              <>
                <RoleIcon role={r} regionId={region} /> {roleDescription(r)}
              </>
            ),
          }))}
        value={value.map((r) => ({
          value: r,
          label: (
            <>
              <RoleIcon role={r} regionId={region} /> {roleShort(r)}
            </>
          ),
        }))}
        onCreateOption={(newValue) =>
          onChange([...value, { id: "", label: newValue, type: "custom" }])
        }
        onChange={(newValue) => onChange(newValue.map((v) => v.value))}
      />
    </div>
  );
}
