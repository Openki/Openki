import React, { ReactNode } from "react";
import { GroupDiscussionEntity } from "../../api/group-discussions/group-discussions";
import { UserModel } from "/imports/api/users/users";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  username: string;
  group: ReactNode;
  commentLink: string;
  subject: string;
  comment: GroupDiscussionEntity;
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
  group,
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
                  { USERNAME: commenterName, COURSE: group },
                )
              : t(
                  "notification.comment.mail.intro.anon",
                  "There was an anonymous comment on {COURSE}:",
                  { COURSE: group },
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
            {!!commenter && (
              <>
                <br />
                <a href={commenterLink}>
                  {t("notification.comment.mail.commenterlink", "➜ See profile from {USERNAME}", {
                    USERNAME: commenterName,
                  })}
                </a>
              </>
            )}
          </p>
        </td>
      </tr>
      <Footer
        receiveNote={
          comment.notifyAll
            ? t("notification.event.mail.notice", { COURSE: group })
            : t("email.base.receiveNote.courseTeam", { COURSE: group })
        }
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
