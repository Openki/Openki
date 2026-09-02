import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";
import { Subscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { User, UserModel } from "/imports/api/users/users";

import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { useUser } from "/imports/utils/react-meteor-data";
import { useAccountTasks } from "/imports/utils/useAccountTasks";
import { useEventListener } from "/imports/utils/useEventListener";
import { cx } from "/imports/utils/cx";
import { Button } from "/imports/ui/components/Buttons";

import { FormControl } from "/imports/ui/components/form-control";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

export interface Props {
  group: GroupModel;
  roleId: RoleEntity["id"];
  afterSubscribe: () => void;
}

export function Enrolling({ group, roleId, afterSubscribe }: Props) {
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

  // Build a subscribe change
  function groupSubscribe(newComment?: string, currentUser: UserModel | null = user) {
    return new Subscribe(
      group,
      roles.map((r) => r.id),
      currentUser?._id,
      roleId,
      "interested",
      newComment,
    );
  }

  function canSubscribe() {
    const operator = user;
    return groupSubscribe().validFor(operator || (new User() as UserModel));
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    routerAutoscroll.cancelNext();
    setIsBusy(true);
    try {
      const currentUser = await promptToLogin(roleId === "participant");
      if (!currentUser) {
        return;
      }
      await processChange(groupSubscribe(comment.trim(), currentUser));

      Analytics.trackEvent(
        "Enrollments in groups",
        `Enrollments in groups as ${roleId}`,
        Regions.findOne(group.region)?.nameEn,
      );

      afterSubscribe();
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

  if (!canSubscribe()) {
    return null;
  }

  const name = `group-role-enroll-${roleId}-content`;

  return (
    <>
      <button
        data-test={`group-role-enroll-${roleId}`}
        className="btn btn-success page-component-btn collapsed d-flex flex-row align-items-center gap-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#${name}`}
        aria-expanded="false"
        aria-controls={name}
      >
        <RoleIcon id={roleId} regionId={group.region} className="grouppage-role-icon" />
        &nbsp;
        {roleSubscribe(roleId)}
        <i
          className={cx("fa-solid fa-fw ms-auto", isCollapsed ? "fa-angle-down" : "fa-angle-up")}
        />
      </button>
      <div ref={collapseRef} className="collapse" id={name}>
        <div className="group-role-enroll-options">
          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <FormControl
                id="role-comment"
                label={roleGroupMessageInfo(roleId)}
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
                id="group-roles-join"
                className="btn-save"
                needsLogin
                visitorUserAllowed={roleId === "participant"}
                isBusy={isBusy}
                busyText={t("group.roles.join.busy", "Joining…")}
              >
                {t("group.roles.join", "Join", { GROUP: group.name })}
              </Button>
              <button
                type="reset"
                className="btn btn-cancel collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#${name}`}
                aria-expanded="false"
                aria-controls={name}
              >
                {t("_button.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
