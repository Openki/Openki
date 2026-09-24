import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { GroupRole } from "/imports/api/groups/groups";
import { ReactSelectCreate } from "/imports/ui/components/react-select/ReactSelectCreate";
import { predefinedRole, RoleType } from "/imports/api/groups/lib/Role";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import { OrganizationModel } from "/imports/api/organizations/organizations";
import { chain } from "lodash-es";
import { isCustom, isSameRole } from "/imports/api/groups/lib/isRole";
import { components, createFilter, MultiValueRemoveProps } from "react-select";
import { uniqGroupRole } from "/imports/api/groups/lib/uniqGroupRole";
import { slug } from "/imports/utils/string-tools";

interface Props {
  region: string;

  organizations: OrganizationModel[];

  value: GroupRole[] | undefined;

  isNewGroup: boolean;

  onChange: (role: Props["value"]) => void;
}

interface RoleOption {
  role: GroupRole;
  value: string;
  ariaLabel: string;
  label: React.JSX.Element;
}

const CustomMultiValueRemove = (props: MultiValueRemoveProps<RoleOption>) => {
  const { t } = useTranslation();

  const { role } = props.data;

  let id;
  switch (role.type) {
    case RoleType.Predefined:
      id = `role-select-${role.id}-${role.type}`;
      break;
    case RoleType.Custom:
      id = `role-select-${slug(role.label)}-${role.type}`;
      break;

    default:
      throw new Error("Unexpected value for role.type");
  }

  return (
    <components.MultiValueRemove
      {...props}
      innerProps={{
        ...props.innerProps,
        id,
        "aria-label": t("group.edit.needs.role.ariaLabel", 'Remove "{ROLE}"', {
          ROLE: props.data.ariaLabel,
        }),
      }}
    />
  );
};

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
          // Skip non-editable roles
          if (!role.editable) {
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
    const regionRole = regionRoles.find((regionRole) => regionRole.id === roleId);
    return regionRole?.preset ?? false;
  }

  if (isLoadingRegionRoles()) {
    return null;
  }

  /**
   * on undefined: initialize with the preset region roles
   * maybe this is not the right place to do this...
   */
  if (!outerValue && isNewGroup) {
    onChange(availableRoles().filter((r) => isRoleEnabled(r.id)));
    return null;
  }
  const value = outerValue || [];

  const options = availableRoles()
    .filter((r) => !value.some((v) => isSameRole(r, v)))
    .map((r) => ({
      role: r,
      value: `${r.id}-${r.type}`,
      ariaLabel: roleShort(r),
      label: (
        <>
          <RoleIcon role={r} regionRoles={regionRoles} /> {roleDescription(r)}
        </>
      ),
    }));

  const selectValue = value
    .filter((r) => isCustom(r) || availableRoles().some((o) => isSameRole(r, o)))
    .map((r) => ({
      role: r,
      value: `${r.id}-${r.type}`,
      ariaLabel: roleShort(r),
      label: (
        <>
          <RoleIcon role={r} regionRoles={regionRoles} /> {roleShort(r)}
        </>
      ),
    }));

  return (
    <div className="col-md">
      <label className="form-label" htmlFor="group-edit-role-select">
        {t("group.edit.needs.role", "This group might need…")}
      </label>
      <ReactSelectCreate
        inputId="group-edit-role-select"
        isMulti
        isClearable
        isSearchable
        hideSelectedOptions
        components={{
          MultiValueRemove: CustomMultiValueRemove,
        }}
        placeholder={t(
          "group.edit.needs.role.placeholder",
          "Select from the list or type in what is needed...",
        )}
        formatCreateLabel={(inputValue) =>
          t("group.edit.needs.role.create", 'Press enter to add "{ROLE}"', { ROLE: inputValue })
        }
        noOptionsMessage={() => t("group.edit.needs.role.noOptions", "Type in what is needed...")}
        options={options}
        value={selectValue}
        filterOption={createFilter({
          stringify: (option) =>
            `${roleDescription(option.data.role)} ${roleShort(option.data.role)} ${option.value}`,
        })}
        onCreateOption={(newValue) =>
          onChange(uniqGroupRole([...value, { id: "", label: newValue, type: "custom" }]))
        }
        onChange={(newValue) => onChange(newValue.map((value) => value.role))}
      />
    </div>
  );
}
