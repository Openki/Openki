import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GroupModel } from "/imports/api/groups/groups";
import { Subscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { UserModel } from "/imports/api/users/users";
import { Button } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { useUser } from "/imports/utils/react-meteor-data";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

export interface Props {
  group: GroupModel;
  roleType: RoleEntity["type"];
  afterSubscribe: () => void;
}

export function Enrolling({ group, roleType, afterSubscribe }: Props) {
  const { t } = useTranslation();
  const [isRolesLoading, roles] = useRegionRoles(group.region);
  const { roleSubscribe, roleGroupMessageInfo } = useRoleDisplay(roles);
  const { promptToLogin } = useAccountTasks();
  const user = useUser();

  const [isBusy, setIsBusy] = useState(false);

  const member = group.members?.find((m) => m.user === user?._id);
  const [comment, setComment] = useState(member?.comment ?? "");

  // Build a subscribe change
  function groupSubscribe(newComment?: string, currentUser: UserModel | null = user) {
    return new Subscribe(
      group,
      roles.map((r) => r.type),
      currentUser?._id,
      roleType,
      "interested",
      newComment,
    );
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    routerAutoscroll.cancelNext();
    setIsBusy(true);
    try {
      const currentUser = await promptToLogin(roleType === "participant");
      if (!currentUser) {
        return;
      }
      await processChange(groupSubscribe(comment.trim(), currentUser));

      Analytics.trackEvent(
        "Enrollments in groups",
        `Enrollments in groups as ${roleType}`,
        Regions.findOne(group.region)?.nameEn,
      );

      afterSubscribe();
    } finally {
      setIsBusy(false);
      routerAutoscroll.cancelNext();
    }
  }

  if (isRolesLoading()) {
    return null;
  }

  const name = `group-role-enroll-${roleType}-content`;

  return (
    <>
      <button
        data-test={`group-role-enroll-${roleType}`}
        className="btn btn-success page-component-btn collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#${name}`}
        aria-expanded="false"
        aria-controls={name}
      >
        <RoleIcon type={roleType} regionId={group.region} className="grouppage-role-icon" />
        &nbsp;
        {roleSubscribe(roleType)}
        <span className="btn btn-link">
          <i className="fa-solid fa-circle-info" />
        </span>
      </button>
      <div className="group-role-enroll-options collapse" id={name}>
        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-3">
            <FormControl
              id="role-comment"
              label={roleGroupMessageInfo(roleType)}
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
              visitorUserAllowed={roleType === "participant"}
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
    </>
  );
}
