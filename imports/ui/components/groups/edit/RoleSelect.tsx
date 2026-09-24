import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chain } from "lodash-es";
import { components, createFilter, MultiValueRemoveProps, InputProps } from "react-select";

import { GroupRole } from "/imports/api/groups/groups";
import { OrganizationModel } from "/imports/api/organizations/organizations";
import { predefinedRole, RoleType } from "/imports/api/groups/lib/Role";
import { isCustom, isSameRole } from "/imports/api/groups/lib/isRole";
import { uniqGroupRole } from "/imports/api/groups/lib/uniqGroupRole";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { slug } from "/imports/utils/string-tools";

import { ReactSelectCreate } from "/imports/ui/components/react-select/ReactSelectCreate";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import { ReactSelect } from "/imports/ui/components/react-select";

interface Props {
  regionId: string;

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

const CustomInput = (props: InputProps<RoleOption, true>) => {
  return (
    <components.Input
      {...props}
      aria-describedby={`group-edit-role-help ${props["aria-describedby"]}`}
    />
  );
};

export function RoleSelect({
  regionId,
  organizations,
  value: outerValue,
  isNewGroup,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const [isLoadingRegionRoles, regionRoles, region] = useRegionRoles(regionId);

  const { roleShort, roleDescription } = useRoleDisplay(regionRoles);

  const disabledCreateRoles = useMemo(() => {
    return chain(organizations)
      .flatMap(({ disableCreateRoles }) => disableCreateRoles ?? [])
      .uniq()
      .value();
  }, [organizations]);

  function availableRoles() {
    if (isLoadingRegionRoles()) {
      return [];
    }

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

  const commonSelectProps = {
    inputId: "group-edit-role-select",
    isMulti: true,
    isClearable: true,
    isSearchable: true,
    hideSelectedOptions: true,
    components: {
      Input: CustomInput,
      MultiValueRemove: CustomMultiValueRemove,
    },
    options,
    value: selectValue,
  } as const;

  return (
    <div className="col-md">
      <label className="form-label" htmlFor="group-edit-role-select">
        {t("group.edit.needs.role", "Roles")}
        <small> {t("_inputField.optional")}</small>
      </label>
      {region?.allowUserCustomRoleCreation ? (
        <ReactSelectCreate
          {...commonSelectProps}
          placeholder={t("group.edit.needs.role.placeholder", "Select or type")}
          formatCreateLabel={(inputValue) =>
            t("group.edit.needs.role.create", 'Add "{ROLE}"', {
              ROLE: inputValue,
            })
          }
          noOptionsMessage={() => t("group.edit.needs.role.noOptions", "Type in any role...")}
          filterOption={createFilter({
            stringify: (option) =>
              `${roleDescription(option.data.role)} ${roleShort(option.data.role)} ${option.value}`,
          })}
          onCreateOption={(newValue) =>
            onChange(uniqGroupRole([...value, { id: "", label: newValue, type: "custom" }]))
          }
          onChange={(newValue) => onChange(newValue.map(({ role }) => role))}
        />
      ) : (
        <ReactSelect
          {...commonSelectProps}
          placeholder={t("group.edit.needs.role.selectOnly.placeholder", "Select")}
          noOptionsMessage={() => t("group.edit.needs.role.selectOnly.noOptions", "No roles")}
          onChange={(newValue) => onChange(newValue.map(({ role }) => role))}
        />
      )}
      <div id="group-edit-role-help" className="form-text">
        {t("group.edit.needs.role.help", "Select roles to share responsibility within the group.")}
      </div>
    </div>
  );
}
