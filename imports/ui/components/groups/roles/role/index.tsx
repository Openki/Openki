import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { User, UserModel } from "/imports/api/users/users";
import * as Alert from "/imports/api/alerts/alert";
import { Subscribe, Unsubscribe, processChange } from "../../../../../api/groups/subscription";
import { Regions } from "/imports/api/regions/regions";
import { RoleEntity } from "/imports/api/regions/regions";
import { GroupModel } from "../../../../../api/groups/groups";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Analytics from "/imports/ui/lib/analytics";
import { getRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Button, ButtonCancel } from "../../../Buttons";
import { Action } from "/imports/ui/components/PleaseLogin";
import { Guide } from "./guide";

import "./styles.scss";

export interface Props {
  role: RoleEntity;
  subscribed: boolean;
  comment: string | undefined;
  group: GroupModel;
}

export function Role(props: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const { roleShort, roleSubscribed, roleSubscribe } = getRoleDisplay(t);
  const searchParams = useSearchParams();
  const [enrolling, setEnrolling] = useState(false);
  const [showFirstSteps, setShowFirstSteps] = useState(false);
  const [comment, setComment] = useState(props.comment);
  const [isRolesLoading, roles] = useRegionRoles(props.group.region);

  // Build a subscribe change
  function groupSubscribe(newComment?: string) {
    return new Subscribe(
      props.group,
      roles.map((r) => r.type),
      user?._id,
      props.role.type,
      "interested",
      newComment,
    );
  }

  function roleIs(type: string) {
    return props.role.type === type;
  }
  function maySubscribe() {
    const operator = user;
    return groupSubscribe().validFor(operator || (new User() as UserModel));
  }

  function handleCommentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setComment(event.currentTarget.value.trim());
  }
  function handleRoleEnrollClick() {
    setEnrolling(true);
  }
  async function handleRoleSubscribeClick() {
    routerAutoscroll.cancelNext();

    await processChange(groupSubscribe(comment));
    routerAutoscroll.cancelNext();
    setShowFirstSteps(true);
    setEnrolling(false);

    Analytics.trackEvent(
      "Enrollments in groups",
      `Enrollments in groups as ${props.role.type}`,
      Regions.findOne(props.group.region)?.nameEn,
    );
  }

  function handleRoleEnrollCancelClick() {
    setEnrolling(false);
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

  if (!isRolesLoading()) {
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
                t("group.roles.unsubscribed", "Unsubscribed from {NAME}", {
                  NAME: props.group.name,
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
              <i className={`${props.role.icon} fa-fw grouppage-role-icon`} />
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
              <b>
                {t("group.roles.firstSteps.title", "Thank you for your interest in {GROUP}.", {
                  GROUP: props.group.name,
                  ROLE: roleShort(props.role.type),
                })}
              </b>
              <br />
              {roleIs("participant") &&
                t(
                  "group.roles.firstSteps.youllGetNotified",
                  "You will get an e-mail notification as soon as a next date has been fixed.",
                )}
              {roleIs("host") &&
                t(
                  "group.roles.firstSteps.informAboutVenue",
                  "If not done already, please mention the venue(s) you have access to in your personal message.",
                )}
              {roleIs("mentor") && (
                <>
                  {t(
                    "group.roles.firstSteps.mentionExperience",
                    "If not done already, please mention your experiences on the topic in your personal message.",
                  )}
                  <Guide />
                </>
              )}
              {roleIs("team") && (
                <>
                  {t(
                    "group.roles.firstSteps.team",
                    "If not done already, you can start with chosing the venue and, if needed, looking for mentor(s) and then fix a date.",
                  )}
                  <Guide />
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
                "All members of the organization-team will be informed.",
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
                <i className={`${props.role.icon} fa-fw grouppage-role-icon`} />
                &nbsp;
                {roleSubscribe(props.role.type)}
              </div>
              <div className="group-role-enroll-options">
                <div className="mb-3">
                  <label className="form-label">
                    {t(
                      "group.roles.leave_message",
                      "You can leave a message to appear next to your name:",
                    )}
                  </label>
                  {roleIs("participant") && (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "group.roles.messageInfoParticipant",
                        "an (optional) message like a greeting, wish, or interest",
                      )}
                      onChange={handleCommentChange}
                    >
                      {comment}
                    </textarea>
                  )}
                  {roleIs("host") && (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "group.roles.messageInfoHost",
                        "an (optional) message including info about the venue",
                      )}
                      onChange={handleCommentChange}
                    >
                      {comment}
                    </textarea>
                  )}
                  {roleIs("mentor") && (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "group.roles.messageInfoMentor",
                        "an (optional) message including info about your experience on the topic",
                      )}
                      onChange={handleCommentChange}
                    >
                      {comment}
                    </textarea>
                  )}
                  {roleIs("team") && (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t("group.roles.messageInfoMentor")}
                      onChange={handleCommentChange}
                    >
                      {comment}
                    </textarea>
                  )}
                </div>
                <div className="form-actions">
                  <Button
                    id="group-roles-join"
                    className="btn-save"
                    onClick={handleRoleSubscribeClick}
                    needsLogin
                    visitorUserAllowed={roleIs("participant")}
                    busyText={t("group.roles.join.busy", "Joining…")}
                  >
                    {t("group.roles.join", "Join", { GROUP: props.group.name })}
                  </Button>
                  <ButtonCancel
                    id="group-roles-join-cancel"
                    onClick={handleRoleEnrollCancelClick}
                  />
                </div>
              </div>
            </>
          ) : (
            maySubscribe() && (
              <button
                data-test={`group-role-enroll-${props.role.type}`}
                type="button"
                className="btn btn-add text-start page-component-btn"
                name={props.role.type}
                onClick={handleRoleEnrollClick}
              >
                <i className={`${props.role.icon} fa-fw grouppage-role-icon`} /> &nbsp;
                {roleSubscribe(props.role.type)}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
