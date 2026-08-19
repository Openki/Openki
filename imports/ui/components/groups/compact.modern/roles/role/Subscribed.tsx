import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GroupModel } from "/imports/api/groups/groups";
import { Unsubscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { Guide } from "/imports/ui/components/groups/roles/role/Guide";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUser } from "/imports/utils/react-meteor-data";
import { Collapse } from "/imports/startup/client/bootstrap";
import { cx } from "/imports/utils/cx";

export interface Props {
  roleType: string;
  group: GroupModel;
  showFirstSteps: boolean;
  onToggle: (value: boolean) => void;
}

export function Subscribed({ roleType, group, showFirstSteps, onToggle }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const collapseRef = useRef<HTMLDivElement>(null);

  const [isRolesLoading, roles] = useRegionRoles(group.region);

  const { roleSubscribed, roleGroupFirstSteps } = useRoleDisplay(roles);

  async function handleRoleUnsubscribeClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.stopPropagation();
    routerAutoscroll.cancelNext();

    const change = new Unsubscribe(group, user?._id, roleType);
    await processChange(change);
    onToggle(false);
    routerAutoscroll.cancelNext();

    Analytics.trackEvent(
      "Unsubscribes from groups",
      `Unsubscribes from groups as ${roleType}`,
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

  if (isRolesLoading()) {
    return null;
  }

  const name = `group-${group._id}-role-enrolled-${roleType}-content`;
  const firstSteps = roleGroupFirstSteps(roleType, { GUIDE: <Guide /> });
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
        <span className="fw-bold text-start">{roleSubscribed(roleType)}</span>
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
