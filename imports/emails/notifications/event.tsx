/* eslint-disable no-nested-ternary */
import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";
import { CourseModel } from "/imports/api/courses/courses";

export type Props = {
  unsubLink: string;
  event: EventModel;
  eventDate: string;
  eventStart: string;
  eventEnd: string;
  eventLink: string;
  venueLine: string | undefined;
  recipientTakePart: boolean | undefined;
  registerToEventLink: string;
  course: CourseModel;
  courseName: string;
  unsubscribeFromCourseLink: string;
  calLink: string;
  isNew: boolean;
  subject: string;
  additionalMessage: string | undefined;
  siteName: string;
  username: string;
  lng: string;
};

export function Event({
  unsubLink,
  event,
  eventDate,
  eventStart,
  eventEnd,
  eventLink,
  venueLine,
  recipientTakePart,
  registerToEventLink,
  course,
  courseName,
  unsubscribeFromCourseLink,
  calLink,
  isNew,
  additionalMessage,
  siteName,
  username,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {isNew
              ? t("notification.event.mail.new", "A new event was just published for {COURSE}:", {
                  COURSE: course,
                })
              : t("notification.event.mail.changed", "The following event for {COURSE} changed:", {
                  COURSE: course,
                })}
          </p>
          {additionalMessage ? (
            <>
              <p>
                {t(
                  "notification.event.mail.personalMessage",
                  "The organizer left a message for you:",
                )}
              </p>
              <table className="comment-box">
                <tr>
                  <td>
                    <span className="pre">{additionalMessage}</span>
                  </td>
                </tr>
              </table>
            </>
          ) : null}

          <table className="event">
            <tr>
              <td className="event-header">
                <a href={eventLink}>
                  <strong>
                    {eventDate}
                    <br />
                    {eventStart}
                    {eventEnd ? ` - ${eventEnd}` : null}
                  </strong>
                  {venueLine ? (
                    <>
                      <br />
                      {venueLine}
                    </>
                  ) : null}
                </a>
              </td>
            </tr>
            <tr>
              <td className="event-gap"></td>
            </tr>
            <tr>
              <td className="event-body">
                <h5 className="title">{event.title}</h5>
                <p dangerouslySetInnerHTML={{ __html: event.description }}></p>
              </td>
            </tr>
            <tr>
              <td className="event-link">
                <a href={calLink}>
                  {t("notification.event.mail.linkCalendar", "Add this event to my calendar")}
                </a>
                <br />
              </td>
            </tr>
          </table>

          {!event.noRsvp ? (
            !recipientTakePart ? (
              <>
                {" "}
                <p className="gap-md text-center">
                  {t(
                    "notification.event.mail.informRegisterEvent",
                    "Let us know if you participate in this event:",
                  )}
                </p>
                <p className="text-center">
                  <a className="button" href={registerToEventLink}>
                    {t("notification.event.mail.registerEvent", "Yes, I take part.")}
                  </a>
                </p>
                <p className="gap-md text-center">
                  {t("notification.event.mail.notinterested", "Not interested anymore?")}
                </p>
                <p className="text-center">
                  <a href={unsubscribeFromCourseLink}>
                    {t("notification.event.mail.unsubscribe", "Unsubscribe from {COURSE}", {
                      COURSE: courseName,
                    })}
                  </a>
                </p>
              </>
            ) : null
          ) : null}
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {t(
                  "notification.event.mail.notice",
                  "You receive this e-mail because you are involved in {COURSE}.",
                  { COURSE: course },
                )}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=eventNotify" })}>
                  {t("email.base.profileLink")}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
