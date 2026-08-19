import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { GroupCustomRole, GroupModel } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Guide } from "/imports/ui/components/groups/roles/role/Guide";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { Collapse } from "/imports/startup/client/bootstrap";
import { cx } from "/imports/utils/cx";
import { useCustomRoleDisplay } from "/imports/utils/getCustomRoleDisplay";
import { unsubscribeFromCustomRole } from "/imports/api/groups/methods";

export interface Props {
  role: GroupCustomRole;
  group: GroupModel;
  showFirstSteps: boolean;
  onToggle: (value: boolean) => void;
}

export function Subscribed({ role, group, showFirstSteps, onToggle }: Props) {
  const { t } = useTranslation();
  const collapseRef = useRef<HTMLDivElement>(null);

  const { roleSubscribed, roleGroupFirstSteps } = useCustomRoleDisplay();
  async function handleRoleUnsubscribeClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.stopPropagation();
    routerAutoscroll.cancelNext();

    await unsubscribeFromCustomRole(group._id, role.id);

    onToggle(false);
    routerAutoscroll.cancelNext();

    Analytics.trackEvent(
      "Unsubscribes from groups",
      `Unsubscribes from groups as ${role.label}`,
      Regions.findOne(group.region)?.nameEn,
    );
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

  const name = `group-${group._id}-role-enrolled-${role.id}-content`;
  const firstSteps = roleGroupFirstSteps(role.label, { GUIDE: <Guide /> });
  return (
    <>
      <button
        className={cx(
          "btn btn-user page-component-btn d-flex flex-row align-items-center gap-1",
          !showFirstSteps && "collapsed",
        )}
        type="button"
        data-bs-toggle="collapse"
        aria-expanded={showFirstSteps}
        aria-controls={name}
        onClick={() => onToggle(!showFirstSteps)}
      >
        <i className="fa-fw" />
        &nbsp;
        {roleSubscribed(role.label)}
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
        <div className="group-role-first-steps">
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
    </>
  );
}
