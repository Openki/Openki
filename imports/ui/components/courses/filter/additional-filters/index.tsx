import React from "react";
import { useTranslation } from "react-i18next";

import { Roles } from "/imports/api/roles/roles";

import { FilterCategories } from "/imports/ui/components/filter-categories";

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
    (role) => ({ ...role, icon: Roles.find((r) => r.type === role.name)?.icon }),
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

  return (
    <>
      <div aria-label="filter-course-roles" className="col-md-3 filter-component" role="group">
        <h4 className="filter-component-header">{t("find.filter.courseRoles", "Roles")}</h4>
        {roles.map((role) => (
          <button
            key={role.name}
            className={`filter-course-role ${roleClasses(role)}`}
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
            <span className="filter-course-role-icon">
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
