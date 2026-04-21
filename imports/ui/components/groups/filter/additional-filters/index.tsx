import React from "react";
import { useTranslation } from "react-i18next";

import { FilterCategories } from "/imports/ui/components/filter-categories";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";

import "./styles.scss";

export interface Props {
  categories: string[];
  onCategoryAdd: (category: string) => void;
  onCategoryRemove: (category: string) => void;
  needsRole: string[];
  onNeedsRoleClick: (role: string) => void;
  onNeedsRoleMouseOver: (role: string) => void;
  onNeedsRoleMouseOut: (role: string) => void;
}

interface Role {
  icon?: string | undefined;
  name: string;
  label: string;
}

export function AdditionalFilters(props: Props) {
  const { t } = useTranslation();
  const currentRegionId = useCurrentRegionId();

  const [isLoading, regionRoles] = useRegionRoles(currentRegionId);

  const roles = [
    {
      name: "team",
      label: t("find.needsTeam", "Looking for a coordinator"),
    },
    {
      name: "mentor",
      label: t("find.needsMentor", "Looking for a mentor"),
    },
    {
      name: "host",
      label: t("find.needsHost", "Looking for a host"),
    },
  ].map(
    // add icon from Roles collection to role object
    (role) => ({ ...role, icon: regionRoles.find((r) => r.type === role.name)?.icon }),
  );

  function roleClasses(role: Role) {
    const classes = [];
    const needsRoleFilter = props.needsRole;

    if (needsRoleFilter?.includes(role.name)) {
      classes.push("active");
    }

    return classes.join(" ");
  }
  function filterCategoriesAttr() {
    return {
      categories: props.categories,
      onAdd: props.onCategoryAdd,
      onRemove: props.onCategoryRemove,
    };
  }

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <div aria-label="filter-group-roles" className="col-md-3 filter-component" role="group">
        <h4 className="filter-component-header">{t("find.filter.groupRoles", "Roles")}</h4>
        {roles.map((role) => (
          <button
            key={role.name}
            className={`filter-group-role ${roleClasses(role)}`}
            type="button"
            onMouseOver={() => {
              props.onNeedsRoleMouseOver(role.name);
            }}
            onMouseOut={() => {
              props.onNeedsRoleMouseOut(role.name);
            }}
            onClick={() => {
              props.onNeedsRoleClick(role.name);
            }}
          >
            <span className="filter-group-role-icon">
              <i className={`${role.icon} fa-fw`} />
            </span>
            &nbsp;
            {role.label}
            &nbsp;
            <i className="fa-solid fa-check" />
          </button>
        ))}
      </div>
      <div className="col-md-3 filter-component">
        <h4 className="filter-component-header">{t("find.filter.categories", "Categories")}</h4>
        <FilterCategories {...filterCategoriesAttr()} />
      </div>
    </>
  );
}
