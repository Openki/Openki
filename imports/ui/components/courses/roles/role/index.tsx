/* eslint-disable no-nested-ternary */
import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { PleaseLogin } from "../../../please-login";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { Subscribe, Unsubscribe, processChange } from "/imports/api/courses/subscription";
import { Regions } from "/imports/api/regions/regions";
import { RoleEntity } from "/imports/api/roles/roles";
import { CourseModel } from "/imports/api/courses/courses";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel } from "/imports/ui/components/buttons";
import { Guide } from "./guide";

import "./styles.scss";

function roleShort(type: string) {
  if (!type) {
    return "";
  }
  return `roles.${type}.short`;
}

export interface Data {
  role: RoleEntity;
  subscribed: boolean;
  comment: string;
  course: CourseModel;
}

export function Role(data: Data) {
  const { t } = useTranslation();
  const user = useUser();
  const searchParams = useSearchParams();
  const [enrolling, setEnrolling] = useState(false);
  const [showFirstSteps, setShowFirstSteps] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [comment, setComment] = useState(data.comment);

  // Build a subscribe change
  function courseSubscribe(newComment?: string) {
    return new Subscribe(data.course, user?._id, data.role.type, "interested", newComment);
  }

  function roleSubscribe(type: string) {
    return t(`roles.${type}.subscribe`);
  }
  function roleSubscribed(type: string) {
    return t(`roles.${type}.subscribed`);
  }
  function roleIs(type: string) {
    return data.role.type === type;
  }
  function maySubscribe() {
    const operator = user;
    return courseSubscribe().validFor(operator);
  }

  function handelCommentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setComment(event.currentTarget.value.trim());
  }
  function handelRoleEnrollClick() {
    setEnrolling(true);
  }
  async function handelRoleSubscribeClick() {
    routerAutoscroll.cancelNext();

    setIsBusy(true);

    await processChange(courseSubscribe(comment));
    routerAutoscroll.cancelNext();
    setIsBusy(false);
    setShowFirstSteps(true);
    setEnrolling(false);

    Analytics.trackEvent(
      "Enrollments in courses",
      `Enrollments in courses as ${data.role.type}`,
      Regions.findOne(data.course.region)?.nameEn,
    );
  }

  function handelRoleEnrollCancelClick() {
    setEnrolling(false);
  }
  async function handelRoleUnsubscribeClick() {
    routerAutoscroll.cancelNext();
    const change = new Unsubscribe(data.course, user?._id, data.role.type);
    await processChange(change);
    routerAutoscroll.cancelNext();
    Analytics.trackEvent(
      "Unsubscribes from courses",
      `Unsubscribes from courses as ${data.role.type}`,
      Regions.findOne(data.course.region)?.nameEn,
    );
  }
  function toggleFirstStepsClick() {
    setShowFirstSteps(!showFirstSteps);
  }
  function handelFirstStepsCommentClick() {
    document.getElementById("discussion")?.dispatchEvent(new Event("writeComment"));
  }

  return (
    <>
      {searchParams.unsubscribe === data.role.type ? (
        // unsubscribe by email
        // HACK this is not the right place to act on router actions
        <PleaseLogin
          type="auto"
          onRender={async () => {
            const change = new Unsubscribe(data.course, user?._id, data.role.type);
            if (change.validFor(user)) {
              await processChange(change);
              Alert.success(
                t("course.roles.unsubscribed", "Unsubscribed from {NAME}", {
                  NAME: data.course.name,
                }),
              );
            } else {
              Alert.error(`${change} not valid for ${user}`);
            }

            // After unsubscribe got to the event. Equals in route 'showCourse'.
            const course = data.course;
            if (course?.singleEvent && course.nextEvent) {
              Router.go("showEvent", course.nextEvent, { replaceState: true });
            }
          }}
        />
      ) : null}
      {data.subscribed ? (
        <>
          <div className="course-role-enrolled">
            <div className="course-role-title">
              <span className={`${data.role.icon} fa-fw coursepage-role-icon`}></span>&nbsp;
              <span>{roleSubscribed(data.role.type)}</span>
              <button
                type="button"
                className="role-unsubscribe-btn btn btn-cancel"
                name={data.role.type}
                onClick={handelRoleUnsubscribeClick}
              >
                {t("course.roles.retract", "Retract")}
              </button>
              <button
                type="button"
                className="toggle-first-steps btn btn-link float-end"
                onClick={toggleFirstStepsClick}
              >
                <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          {showFirstSteps ? (
            <div className="course-role-first-steps">
              <b>
                {t("course.roles.firstSteps.title", "Thank you for your interest in {COURSE}.", {
                  COURSE: data.course.name,
                  ROLE: t(roleShort(data.role.type)),
                })}
              </b>
              <br />
              {roleIs("participant")
                ? t(
                    "course.roles.firstSteps.youllGetNotified",
                    "You will get an e-mail notification as soon as a next date has been fixed.",
                  )
                : null}
              {roleIs("host")
                ? t(
                    "course.roles.firstSteps.informAboutVenue",
                    "If not done already, please mention the venue(s) you have access to in your personal message info.",
                  )
                : null}
              {roleIs("mentor") ? (
                <>
                  {t(
                    "course.roles.firstSteps.mentionExperience",
                    "If not done already, please mention your experiences on the topic in your personal message info.",
                  )}
                  <Guide />
                </>
              ) : null}
              {roleIs("team") ? (
                <>
                  {t(
                    "course.roles.firstSteps.team",
                    "If not done already, you can start with chosing the venue and, if needed, looking for mentor(s) and then fix a date.",
                  )}
                  <Guide />
                </>
              ) : null}
              <br />
              <br />
              {t(
                "course.roles.firstSteps.ifQuestions",
                "Please write questions concerning the course in the discussion below.",
              )}
              <br />
              {t(
                "course.roles.firstSteps.allMembersInformed",
                "All members of the organization-team will be informed.",
              )}
              <br />
              <button
                className="btn btn-link p-0"
                type="button"
                onClick={handelFirstStepsCommentClick}
              >
                {t("course.discussion.write_comment")}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className={enrolling ? "course-role-enroll" : "course-role"}>
          {enrolling ? (
            <>
              <div className="course-role-title-enroll">
                <span
                  className={`${data.role.icon} fa-fw coursepage-role-icon`}
                  aria-hidden="true"
                ></span>
                &nbsp;
                {roleSubscribe(data.role.type)}
              </div>
              <div className="course-role-enroll-options">
                <div className="mb-3">
                  <label className="form-label">
                    {t(
                      "course.roles.leave_message",
                      "You can leave a message to appear next to your name:",
                    )}
                  </label>
                  {roleIs("participant") ? (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "course.roles.messageInfoParticipant",
                        "an (optional) message like a greeting, wish, or interest",
                      )}
                      onChange={handelCommentChange}
                    >
                      {comment}
                    </textarea>
                  ) : null}
                  {roleIs("host") ? (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "course.roles.messageInfoHost",
                        "an (optional) message including info about the venue",
                      )}
                      onChange={handelCommentChange}
                    >
                      {comment}
                    </textarea>
                  ) : null}
                  {roleIs("mentor") ? (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t(
                        "course.roles.messageInfoMentor",
                        "an (optional) message including info about your experience on the topic",
                      )}
                      onChange={handelCommentChange}
                    >
                      {comment}
                    </textarea>
                  ) : null}
                  {roleIs("team") ? (
                    <textarea
                      className="form-control js-comment"
                      placeholder={t("course.roles.messageInfoMentor")}
                      onChange={handelCommentChange}
                    >
                      {comment}
                    </textarea>
                  ) : null}
                </div>
                <div className="form-actions">
                  <PleaseLogin
                    type="button"
                    className="btn btn-save"
                    disabled={isBusy}
                    onClick={handelRoleSubscribeClick}
                    visitorUserAllowed={data.role.type === "participant"}
                  >
                    {isBusy ? (
                      <>
                        <i
                          className="fa-solid fa-circle-notch fa-spin fa-fw"
                          aria-hidden="true"
                        ></i>{" "}
                        {t("course.roles.join.busy", "Joining…")}
                      </>
                    ) : (
                      t("course.roles.join", "Join {COURSE}", { COURSE: data.course.name })
                    )}
                  </PleaseLogin>
                  <ButtonCancel onClick={handelRoleEnrollCancelClick} />
                </div>
              </div>
            </>
          ) : maySubscribe() ? (
            <button
              type="button"
              className="btn btn-add text-start page-component-btn"
              name="participant"
              onClick={handelRoleEnrollClick}
            >
              <span
                className={`${data.role.icon} fa-fw coursepage-role-icon`}
                aria-hidden="true"
              ></span>
              &nbsp;
              {roleSubscribe(data.role.type)}
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
