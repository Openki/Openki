import { TFunction } from "i18next";
import React from "react";
import { CourseDiscussionEnity } from "/imports/api/course-discussions/course-discussions";
import { UserModel } from "/imports/api/users/users";
import { Router } from "meteor/iron:router";

export interface Props {
  username: string;
  unsubLink: string;
  course: any;
  commentLink: string;
  subject: string;
  comment: CourseDiscussionEnity;
  commenter: UserModel | undefined;
  commenterLink: string;
  commenterName: string | undefined;
  siteName: string;
  customSiteName: string;
  t: TFunction;
}

export function Comment({
  username,
  unsubLink,
  course,
  commentLink,
  comment,
  commenter,
  commenterLink,
  commenterName,
  siteName,
  customSiteName,
  t,
}: Props) {
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {commenter
              ? t(
                  "notification.comment.mail.intro",
                  "There was a comment by {USERNAME} on {COURSE}:",
                  { USERNAME: commenterName, COURSE: course },
                )
              : t(
                  "notification.comment.mail.intro.anon",
                  "There was an anonymous comment on {COURSE}:",
                  { COURSE: course },
                )}
          </p>
          <table className="comment-box">
            <tr>
              <td>
                <h5 className="title">{comment.title}</h5>
                <p dangerouslySetInnerHTML={{ __html: comment.text }}></p>
              </td>
            </tr>
          </table>
          <p>
            <a href={commentLink}>
              {t("notification.comment.mail.linktext", "➜ See comment on {SITENAME}", {
                SITENAME: customSiteName,
              })}
            </a>
            {commenter ? (
              <>
                <br />
                <a href={commenterLink}>
                  {t("notification.comment.mail.commenterlink", "➜ See profile from {USERNAME}", {
                    USERNAME: commenterName,
                  })}
                </a>
              </>
            ) : null}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {comment.notifyAll
                  ? t("notification.event.mail.notice", { COURSE: course })
                  : t("email.base.receiveNote.courseTeam", { COURSE: course })}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=commentNotify" })}>
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
