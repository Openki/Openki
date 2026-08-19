import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GroupCustomRole, GroupModel } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";

import { useCustomRoleDisplay } from "/imports/utils/getCustomRoleDisplay";
import { useUser } from "/imports/utils/react-meteor-data";
import { useAccountTasks } from "/imports/utils/useAccountTasks";
import { useEventListener } from "/imports/utils/useEventListener";
import { cx } from "/imports/utils/cx";
import { Button } from "/imports/ui/components/Buttons";

import { FormControl } from "/imports/ui/components/form-control";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { subscribeToCustomRole } from "/imports/api/groups/methods";

export interface Props {
  group: GroupModel;
  role: GroupCustomRole;
  afterSubscribe: () => void;
}

export function Enrolling({ group, role, afterSubscribe }: Props) {
  const { t } = useTranslation();
  const { roleSubscribe, roleGroupMessageInfo } = useCustomRoleDisplay();
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
      const currentUser = await promptToLogin();
      if (!currentUser) {
        return;
      }

      subscribeToCustomRole(group._id, role.id, comment.trim());

      Analytics.trackEvent(
        "Enrollments in groups",
        `Enrollments in groups as ${role.label}`,
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

  const name = `group-role-enroll-${role.id}-content`;

  return (
    <>
      <button
        data-test={`group-role-enroll-${role.id}`}
        className="btn btn-success page-component-btn collapsed d-flex flex-row align-items-center gap-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#${name}`}
        aria-expanded="false"
        aria-controls={name}
      >
        <i className="fa-fw" />
        &nbsp;
        {roleSubscribe(role.label)}
        <i
          className={cx("fa-solid fa-fw ms-auto", isCollapsed ? "fa-angle-down" : "fa-angle-up")}
        />
      </button>
      <div ref={collapseRef} className="collapse" id={name}>
        <div className="group-role-enroll-options">
          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <FormControl
                id={`role-${role.id}-comment`}
                label={roleGroupMessageInfo(role.label)}
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
                disabled={isBusy}
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
