import React from "react";
import { useTranslation } from "react-i18next";

import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { FilterCategories } from "/imports/ui/components/filter-categories";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

interface RolesButtonProps {
  needsRole: string[];
  onNeedsRoleClick: (role: string) => void;
  onNeedsRoleMouseOver: (role: string) => void;
  onNeedsRoleMouseOut: (role: string) => void;
  currentRegionId: string;
}

function RolesButton(props: RolesButtonProps) {
  const [isLoading, regionRoles] = useRegionRoles(props.currentRegionId);
  const { roleNeeded } = useRoleDisplay(regionRoles);

  if (isLoading()) {
    return null;
  }

  return regionRoles
    .filter((role) => role.id !== "participant")
    .map((role) => (
      <button
        key={role.id}
        className={cx("filter-group-role", props.needsRole?.includes(role.id) && "active")}
        type="button"
        onMouseOver={() => props.onNeedsRoleMouseOver(role.id)}
        onMouseOut={() => props.onNeedsRoleMouseOut(role.id)}
        onClick={() => props.onNeedsRoleClick(role.id)}
      >
        <span className="filter-group-role-icon">
          <i className={cx(role.icon, "fa-fw")} />
        </span>
        &nbsp;
        {roleNeeded(role.id)}
        &nbsp;
        <i className="fa-solid fa-check" />
      </button>
    ));
}

export interface Props {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
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
      {!!currentRegionId && (
        <div aria-label="filter-group-roles" className="col-md-3 filter-component" role="group">
          <h4 className="filter-component-header">{t("find.filter.groupRoles", "Roles")}</h4>
          <RolesButton
            currentRegionId={currentRegionId}
            needsRole={props.needsRole}
            onNeedsRoleClick={props.onNeedsRoleClick}
            onNeedsRoleMouseOver={props.onNeedsRoleMouseOver}
            onNeedsRoleMouseOut={props.onNeedsRoleMouseOut}
          />
        </div>
      )}
      <div className="col-md-3 filter-component">
        <h4 className="filter-component-header">{t("find.filter.categories", "Categories")}</h4>
        <FilterCategories categories={props.categories} onChange={props.onCategoriesChange} />
      </div>
    </>
  );
}
