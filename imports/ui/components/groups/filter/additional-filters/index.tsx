import React from "react";
import { useTranslation } from "react-i18next";

import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";
import { predefinedRole, SystemRoles } from "/imports/api/groups/lib/Role";

import { FilterCategories } from "/imports/ui/components/filter-categories";
import { RoleIcon } from "/imports/ui/components/RoleIcon";

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

  return (
    <div className="d-flex flex-column gap-1">
      {regionRoles
        .filter((role) => role.id !== SystemRoles.Participant.id)
        .map((regionRole) => {
          const role = predefinedRole(regionRole.id);
          const active = props.needsRole?.includes(role.id);
          return (
            <button
              key={role.id}
              className={cx("filter-group-role", active && "active")}
              type="button"
              onMouseOver={() => props.onNeedsRoleMouseOver(role.id)}
              onMouseOut={() => props.onNeedsRoleMouseOut(role.id)}
              onClick={() => props.onNeedsRoleClick(role.id)}
            >
              <span className="filter-group-role-icon me-2 px-2 py-1 d-inline-block">
                <RoleIcon role={role} regionRoles={regionRoles} />
              </span>
              {roleNeeded(role)}
              {active && <i className="ms-1 fa-solid fa-check" />}
            </button>
          );
        })}
    </div>
  );
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
