import React from "react";
import { useTranslation } from "react-i18next";
import { GroupModel } from "/imports/api/groups/groups";
import { Unsubscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { Guide } from "/imports/ui/components/groups/roles/role/Guide";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUser } from "/imports/utils/react-meteor-data";

export interface Props {
  roleType: string;
  group: GroupModel;
  showFirstSteps: boolean;
  onToggle: (value: boolean) => void;
}

export function Subscribed({ roleType, group, showFirstSteps, onToggle }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRolesLoading, roles] = useRegionRoles(group.region);

  const { roleShort, roleSubscribed, roleGroupFirstSteps } = useRoleDisplay(roles);

  async function handleRoleUnsubscribeClick() {
    routerAutoscroll.cancelNext();
    const change = new Unsubscribe(group, user?._id, roleType);
    await processChange(change);
    routerAutoscroll.cancelNext();

    Analytics.trackEvent(
      "Unsubscribes from groups",
      `Unsubscribes from groups as ${roleType}`,
      Regions.findOne(group.region)?.nameEn,
    );
  }
  function toggleFirstStepsClick() {
    onToggle(!showFirstSteps);
  }

  if (isRolesLoading()) {
    return null;
  }

  return (
    <>
      <div className="group-role-enrolled">
        <div className="group-role-title">
          <RoleIcon type={roleType} regionId={group.region} className="grouppage-role-icon" />
          &nbsp;
          {roleSubscribed(roleType)}
          <button
            type="button"
            className="role-unsubscribe-btn btn btn-cancel"
            onClick={handleRoleUnsubscribeClick}
          >
            {t("group.roles.retract", "Retract")}
          </button>
          <button
            type="button"
            className="toggle-first-steps btn btn-link float-end"
            onClick={toggleFirstStepsClick}
          >
            <i className="fa-solid fa-circle-info" />
          </button>
        </div>
      </div>

      {showFirstSteps && (
        <div className="group-role-first-steps">
          <span className="fw-bold">
            {t("group.roles.firstSteps.title", "Thank you for your interest in {GROUP}.", {
              GROUP: group.name,
              ROLE: roleShort(roleType),
            })}
          </span>
          <br />
          <span className="pre-line">
            {roleGroupFirstSteps(roleType, { COORDINATION_GUIDE: <Guide /> })}
          </span>
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
        </div>
      )}
    </>
  );
}
