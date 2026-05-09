import React from "react";
import { useTranslation } from "react-i18next";

import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { getRoleDisplay } from "/imports/utils/getRoleDisplay";
import { FilterCategories } from "/imports/ui/components/filter-categories";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

function RolesButton(props: {
  needsRole: string[];
  onNeedsRoleClick: (role: string) => void;
  onNeedsRoleMouseOver: (role: string) => void;
  onNeedsRoleMouseOut: (role: string) => void;
}) {
  const { t } = useTranslation();
  const currentRegionId = useCurrentRegionId();
  const { roleNeeded } = getRoleDisplay(t);
  const [isLoading, regionRoles] = useRegionRoles(currentRegionId);

  if (isLoading()) {
    return null;
  }

  return regionRoles
    .filter((role) => role.type !== "participant")
    .map((role) => (
      <button
        key={role.type}
        className={cx("filter-group-role", props.needsRole?.includes(role.type) && "active")}
        type="button"
        onMouseOver={() => props.onNeedsRoleMouseOver(role.type)}
        onMouseOut={() => props.onNeedsRoleMouseOut(role.type)}
        onClick={() => props.onNeedsRoleClick(role.type)}
      >
        <span className="filter-group-role-icon">
          <i className={cx(role.icon, "fa-fw")} />
        </span>
        &nbsp;
        {roleNeeded(role.type)}
        &nbsp;
        <i className="fa-solid fa-check" />
      </button>
    ));
}

export interface Props {
  categories: string[];
  onCategoryAdd: (category: string) => void;
  onCategoryRemove: (category: string) => void;
  needsRole: string[];
  onNeedsRoleClick: (role: string) => void;
  onNeedsRoleMouseOver: (role: string) => void;
  onNeedsRoleMouseOut: (role: string) => void;
}

export function AdditionalFilters(props: Props) {
  const { t } = useTranslation();
  const currentRegionId = useCurrentRegionId();

  return (
    <>
      {/*
        NOTE: Since regions can have different roles, the current role-based filters
        don't work for "All regions" because we could potentially need to show 20+ roles.
        We need a better UI to filter by roles and until we fix this properly, we hide the
        role-based filtering when "All regions is selected".
      */}
      {Boolean(currentRegionId) && (
        <div aria-label="filter-group-roles" className="col-md-3 filter-component" role="group">
          <h4 className="filter-component-header">{t("find.filter.groupRoles", "Roles")}</h4>
          <RolesButton
            needsRole={props.needsRole}
            onNeedsRoleClick={props.onNeedsRoleClick}
            onNeedsRoleMouseOver={props.onNeedsRoleMouseOver}
            onNeedsRoleMouseOut={props.onNeedsRoleMouseOut}
          />
        </div>
      )}
      <div className="col-md-3 filter-component">
        <h4 className="filter-component-header">{t("find.filter.categories", "Categories")}</h4>
        <FilterCategories
          categories={props.categories}
          onAdd={props.onCategoryAdd}
          onRemove={props.onCategoryRemove}
        />
      </div>
    </>
  );
}
