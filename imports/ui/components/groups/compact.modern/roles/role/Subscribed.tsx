import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GroupModel, GroupRole } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Guide } from "/imports/ui/components/groups/roles/role/Guide";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { Collapse } from "/imports/startup/client/bootstrap";
import { cx } from "/imports/utils/cx";
import { unsubscribeFromRole } from "/imports/api/groups/methods";
import { RoleType } from "/imports/api/groups/lib/Role";

export interface Props {
  role: GroupRole;
  group: GroupModel;
  showFirstSteps: boolean;
  onToggle: (value: boolean) => void;
}

export function Subscribed({ role, group, showFirstSteps, onToggle }: Props) {
  const { t } = useTranslation();
  const collapseRef = useRef<HTMLDivElement>(null);

  const [isRolesLoading, roles] = useRegionRoles(group.region);

  const { roleSubscribed, roleGroupFirstSteps } = useRoleDisplay(roles);

  async function handleRoleUnsubscribeClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.stopPropagation();
    routerAutoscroll.cancelNext();

    await unsubscribeFromRole(group._id, { id: role.id, type: role.type });

    onToggle(false);
    routerAutoscroll.cancelNext();

    switch (role.type) {
      case RoleType.Predefined:
        Analytics.trackEvent(
          "Unsubscribes from groups",
          `Unsubscribes from groups as ${role.id}`,
          Regions.findOne(group.region)?.nameEn,
        );
        break;
      case RoleType.Custom:
        Analytics.trackEvent(
          "CustomRoles: Unsubscribes from groups",
          `Unsubscribes from groups as ${role.label}`,
          Regions.findOne(group.region)?.nameEn,
        );
        break;

      default:
        throw new Error("Unexpected value for role.type");
    }
  }

  useEffect(() => {
    const collapseElement = collapseRef.current;
    if (!collapseElement) {
      return;
    }

    if (showFirstSteps) {
      Collapse.getOrCreateInstance(collapseElement, {
        toggle: false,
      })?.show();
    } else {
      Collapse.getOrCreateInstance(collapseElement, {
        toggle: false,
      })?.hide();
    }
  }, [collapseRef, showFirstSteps]);

  if (isRolesLoading()) {
    return null;
  }

  const name = `group-${group._id}-role-enrolled-${role.id}-content`;
  const firstSteps = roleGroupFirstSteps(role, { GUIDE: <Guide /> });
  return (
    <div className="d-grid">
      <button
        className={cx(
          "group-role-btn btn btn-user btn-lg d-flex flex-row align-items-center gap-1",
          !showFirstSteps && "collapsed",
        )}
        type="button"
        data-bs-toggle="collapse"
        aria-expanded={showFirstSteps}
        aria-controls={name}
        onClick={() => onToggle(!showFirstSteps)}
      >
        <span className="fw-bold text-start">{roleSubscribed(role)}</span>
        {!showFirstSteps && (
          <button
            type="button"
            className="role-unsubscribe-btn btn btn-sm btn-cancel"
            onClick={handleRoleUnsubscribeClick}
          >
            {t("group.roles.retract", "Retract")}
          </button>
        )}
        <i
          className={cx("fa-solid fa-fw ms-auto", showFirstSteps ? "fa-angle-up" : "fa-angle-down")}
        />
      </button>

      <div className="collapse" id={name} ref={collapseRef}>
        <div className="border border-top-0 border-user rounded-bottom-3 bg-user-subtle p-3">
          <span className="fw-bold">
            {t("group.roles.firstSteps.title", "Thank you for your interest in {GROUP}.", {
              GROUP: group.name,
            })}
          </span>
          {Boolean(firstSteps) && (
            <>
              <br />
              <span className="pre-line">{firstSteps}</span>
            </>
          )}
          <br />
          <br />
          {t(
            "group.roles.firstSteps.ifQuestions",
            "Please write questions concerning the group in the discussion below.",
          )}
          <br />
          {t(
            "group.roles.firstSteps.allMembersInformed",
            "All members of the coordination team will be informed.",
          )}
          <div className="text-end mt-1">
            {showFirstSteps && (
              <button type="button" className="btn btn-cancel" onClick={handleRoleUnsubscribeClick}>
                {t("group.roles.retract", "Retract")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
