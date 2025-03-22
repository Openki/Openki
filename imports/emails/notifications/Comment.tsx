import React from "react";
import { CourseDiscussionEntity } from "/imports/api/course-discussions/course-discussions";
import { UserModel } from "/imports/api/users/users";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  username: string;
  course: any;
  commentLink: string;
  subject: string;
  comment: CourseDiscussionEntity;
  commenter: UserModel | undefined;
  commenterLink: string;
  commenterName: string | undefined;
  customSiteName: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function Comment({
  username,
  course,
  commentLink,
  comment,
  commenter,
  commenterLink,
  commenterName,
  customSiteName,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

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
      <Footer
        receiveNote={
          comment.notifyAll
            ? t("notification.event.mail.notice", { COURSE: course })
            : t("email.base.receiveNote.courseTeam", { COURSE: course })
        }
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
