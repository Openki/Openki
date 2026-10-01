import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { slug } from "/imports/utils/string-tools";

import { GroupModel, GroupRole } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";
import { subscribeToRole } from "/imports/api/groups/methods";

import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUser } from "/imports/utils/react-meteor-data";
import { useAccountTasks } from "/imports/utils/useAccountTasks";
import { useEventListener } from "/imports/utils/useEventListener";
import { cx } from "/imports/utils/cx";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "../../../../../hooks/useRegionRoles";
import { isParticipant } from "/imports/api/groups/lib/isRole";
import { RoleType } from "/imports/api/groups/lib/Role";

import { Button } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";

export interface Props {
  group: GroupModel;
  role: GroupRole;
  afterSubscribe: () => void;
}

export function Enrolling({ group, role, afterSubscribe }: Props) {
  const { t } = useTranslation();
  const [isRolesLoading, roles] = useRegionRoles(group.region);
  const { roleSubscribe, roleGroupMessageInfo } = useRoleDisplay(roles);
  const { promptToLogin } = useAccountTasks();
  const collapseRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const user = useUser();

  const [isBusy, setIsBusy] = useState(false);

  const member = group.members?.find((m) => m.user === user?._id);
  const [comment, setComment] = useState(member?.comment ?? "");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    routerAutoscroll.cancelNext();
    setIsBusy(true);
    try {
      const currentUser = await promptToLogin(isParticipant(role));
      if (!currentUser) {
        return;
      }
      try {
        await subscribeToRole(group._id, { id: role.id, type: role.type }, comment.trim(), true);

        switch (role.type) {
          case RoleType.Predefined:
            Analytics.trackEvent(
              "Enrollments in groups",
              `Enrollments in groups as ${role.id}`,
              Regions.findOne(group.region)?.nameEn,
            );
            break;
          case RoleType.Custom:
            Analytics.trackEvent(
              "CustomRoles: Enrollments in groups",
              `Enrollments in groups as ${role.label}`,
              Regions.findOne(group.region)?.nameEn,
            );
            break;

          default:
            throw new Error("Unexpected value for role.type");
        }

        afterSubscribe();
      } catch (err) {
        Alert.serverError(
          err,
          t("group.roles.join.error", "Failed to join {GROUP}", {
            GROUP: group.name,
          }),
        );
      }
    } finally {
      setIsBusy(false);
      routerAutoscroll.cancelNext();
    }
  }

  useEventListener(collapseRef, "show.bs.collapse", () => {
    setIsCollapsed(false);
  });

  useEventListener(collapseRef, "hide.bs.collapse", () => {
    setIsCollapsed(true);
  });

  if (isRolesLoading()) {
    return null;
  }

  let id;
  switch (role.type) {
    case RoleType.Predefined:
      id = `group-${group._id}-role-enroll-${role.id}-${role.type}`;
      break;
    case RoleType.Custom:
      id = `group-${group._id}-role-enroll-${slug(role.label)}-${role.type}`;
      break;

    default:
      throw new Error("Unexpected value for role.type");
  }

  return (
    <div className="d-grid">
      <button
        data-test={`${id}-button`}
        className="group-role-btn btn btn-add btn-lg text-start collapsed d-flex flex-row align-items-center gap-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#${id}`}
        aria-expanded="false"
        aria-controls={id}
      >
        <span className="fw-bold text-start">{roleSubscribe(role)}</span>
        <i
          className={cx("fa-solid fa-fw ms-auto", isCollapsed ? "fa-angle-down" : "fa-angle-up")}
        />
      </button>
      <div ref={collapseRef} className="collapse" id={id}>
        <div className="border border-top-0 border-success rounded-bottom-3 bg-success-subtle p-3">
          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <FormControl
                id={`${id}-comment`}
                label={roleGroupMessageInfo(role)}
                onChange={(value) => setComment(value)}
                type="text"
                autoFocus
                optional
                value={comment}
              />
            </div>
            <div className="form-actions">
              <Button
                submit
                id={`${id}-join`}
                className="btn-save"
                needsLogin
                visitorUserAllowed={isParticipant(role)}
                isBusy={isBusy}
                busyText={t("group.roles.join.busy", "Joining…")}
              >
                {t("group.roles.join", "Join", { GROUP: group.name })}
              </Button>
              <button
                type="reset"
                className="btn btn-cancel collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#${id}`}
                aria-expanded="false"
                aria-controls={id}
                disabled={isBusy}
              >
                {t("_button.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
