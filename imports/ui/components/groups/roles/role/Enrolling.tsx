import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GroupModel } from "/imports/api/groups/groups";
import { Subscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { UserModel, User } from "/imports/api/users/users";
import { Button, ButtonCancel } from "/imports/ui/components/Buttons";
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

export function Enrolling({
  group,
  roleType,
  afterSubscribe,
}: Props) {
  const { t } = useTranslation();
  const [isRolesLoading, roles] = useRegionRoles(group.region);
  const { roleSubscribe, roleGroupMessageInfo } = useRoleDisplay(roles);
  const user = useUser();

  const [enrolling, setEnrolling] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const { promptToLogin } = useAccountTasks();

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

  function canSubscribe() {
    const operator = user;
    return groupSubscribe().validFor(operator || (new User() as UserModel));
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

      setEnrolling(false);

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

  return (
    <div className={enrolling ? "group-role-enroll" : "group-role"}>
      {enrolling ? (
        <>
          <div className="group-role-title-enroll">
            <RoleIcon type={roleType} regionId={group.region} className="grouppage-role-icon" />
            &nbsp;
            {roleSubscribe(roleType)}
          </div>
          <div className="group-role-enroll-options">
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
                <ButtonCancel id="group-roles-join-cancel" onClick={() => setEnrolling(false)} />
              </div>
            </form>
          </div>
        </>
      ) : (
        canSubscribe() && (
          <button
            data-test={`group-role-enroll-${roleType}`}
            type="button"
            className="btn btn-add text-start page-component-btn"
            name={roleType}
            onClick={() => setEnrolling(true)}
          >
            <RoleIcon type={roleType} regionId={group.region} className="grouppage-role-icon" />
            {roleSubscribe(roleType)}
          </button>
        )
      )}
    </div>
  );
}
