import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { User, UserModel } from "/imports/api/users/users";
import * as Alert from "/imports/api/alerts/alert";
import { Subscribe, Unsubscribe, processChange } from "/imports/api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { GroupModel } from "/imports/api/groups/groups";
import { RoleEntity } from "/imports/utils/PublicSettings";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Analytics from "/imports/ui/lib/analytics";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";

import { FormControl } from "../../../form-control";
import { Button, ButtonCancel } from "../../../Buttons";
import { Action } from "/imports/ui/components/PleaseLogin";
import { Guide } from "./guide";

import "./styles.scss";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

export interface Props {
  role: RoleEntity;
  subscribed: boolean;
  comment: string | undefined;
  group: GroupModel;
}

export function Role(props: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const searchParams = useSearchParams();
  const [isRolesLoading, roles] = useRegionRoles(props.group.region);
  const { roleShort, roleSubscribed, roleSubscribe, roleGroupFirstSteps, roleGroupMessageInfo } =
    useRoleDisplay(roles);
  const [enrolling, setEnrolling] = useState(false);
  const [showFirstSteps, setShowFirstSteps] = useState(false);
  const [comment, setComment] = useState(props.comment ?? "");
  const [isBusy, setIsBusy] = useState(false);
  const { promptToLogin } = useAccountTasks();

  // Build a subscribe change
  function groupSubscribe(newComment?: string, currentUser: UserModel | null = user) {
    return new Subscribe(
      props.group,
      roles.map((r) => r.type),
      currentUser?._id,
      props.role.type,
      "interested",
      newComment,
    );
  }

  function roleIs(type: string) {
    return props.role.type === type;
  }
  function canSubscribe() {
    const operator = user;
    return groupSubscribe().validFor(operator || (new User() as UserModel));
  }
  async function handleRoleSubscribeSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    routerAutoscroll.cancelNext();
    setIsBusy(true);
    try {
      const currentUser = await promptToLogin(props.role.type === "participant");
      if (!currentUser) {
        return;
      }
      await processChange(groupSubscribe(comment.trim(), currentUser));

      setShowFirstSteps(true);
      setEnrolling(false);

      Analytics.trackEvent(
        "Enrollments in groups",
        `Enrollments in groups as ${props.role.type}`,
        Regions.findOne(props.group.region)?.nameEn,
      );
    } finally {
      setIsBusy(false);
      routerAutoscroll.cancelNext();
    }
  }

  async function handleRoleUnsubscribeClick() {
    routerAutoscroll.cancelNext();
    const change = new Unsubscribe(props.group, user?._id, props.role.type);
    await processChange(change);
    routerAutoscroll.cancelNext();

    Analytics.trackEvent(
      "Unsubscribes from groups",
      `Unsubscribes from groups as ${props.role.type}`,
      Regions.findOne(props.group.region)?.nameEn,
    );
  }
  function toggleFirstStepsClick() {
    setShowFirstSteps(!showFirstSteps);
  }
  function handleFirstStepsCommentClick() {
    document.getElementById("discussion")?.dispatchEvent(new Event("writeComment"));
  }

  if (isRolesLoading()) {
    return null;
  }

  return (
    <>
      {searchParams.unsubscribe === props.role.type && (
        <Action
          onRender={async () => {
            // unsubscribe by email
            // HACK this is not the right place to act on router actions
            const change = new Unsubscribe(props.group, user?._id, props.role.type);
            if (change.validFor(user)) {
              await processChange(change);
              Alert.success(
                t("group.roles.unsubscribed", "Unsubscribed from {GROUP}", {
                  GROUP: props.group.name,
                }),
              );
            } else {
              Alert.error(`${change} not valid for ${user}`);
            }

            // After unsubscribe got to the event. Equals in route 'showGroup'.
            const group = props.group;
            if (group?.singleEvent && group.nextEvent) {
              Router.go("showEvent", group.nextEvent, { replaceState: true });
            }
          }}
        />
      )}

      {props.subscribed ? (
        <>
          <div className="group-role-enrolled">
            <div className="group-role-title">
              <i className={cx(props.role.icon, "fa-fw grouppage-role-icon")} />
              &nbsp;
              <span>{roleSubscribed(props.role.type)}</span>
              <button
                type="button"
                className="role-unsubscribe-btn btn btn-cancel"
                name={props.role.type}
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
                  GROUP: props.group.name,
                  ROLE: roleShort(props.role.type),
                })}
              </span>
              <br />
              <span className="whitespace-pre-line">
                {roleGroupFirstSteps(props.role.type, { COORDINATION_GUIDE: <Guide /> })}
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
              <br />
              <button
                className="btn btn-link p-0"
                type="button"
                onClick={handleFirstStepsCommentClick}
              >
                {t("group.discussion.write_comment")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={enrolling ? "group-role-enroll" : "group-role"}>
          {enrolling ? (
            <>
              <div className="group-role-title-enroll">
                <i className={cx(props.role.icon, "fa-fw grouppage-role-icon")} />
                &nbsp;
                {roleSubscribe(props.role.type)}
              </div>
              <div className="group-role-enroll-options">
                <form noValidate onSubmit={handleRoleSubscribeSubmit}>
                  <div className="mb-3">
                    <FormControl
                      id="role-comment"
                      label={roleGroupMessageInfo(props.role.type)}
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
                      visitorUserAllowed={roleIs("participant")}
                      isBusy={isBusy}
                      busyText={t("group.roles.join.busy", "Joining…")}
                    >
                      {t("group.roles.join", "Join", { GROUP: props.group.name })}
                    </Button>
                    <ButtonCancel
                      id="group-roles-join-cancel"
                      onClick={() => setEnrolling(false)}
                    />
                  </div>
                </form>
              </div>
            </>
          ) : (
            canSubscribe() && (
              <button
                data-test={`group-role-enroll-${props.role.type}`}
                type="button"
                className="btn btn-add text-start page-component-btn"
                name={props.role.type}
                onClick={() => setEnrolling(true)}
              >
                <i className={cx(props.role.icon, "fa-fw grouppage-role-icon")} /> &nbsp;
                {roleSubscribe(props.role.type)}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
