import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

export type Props = {
  unsubLink: string;
  course: React.JSX.Element;
  newParticipant: React.JSX.Element;
  roleTitle: string;
  roleType: string;
  email: React.JSX.Element;
  message: string | undefined;
  appendCollaborationHint: boolean;
  figures: {
    role: string;
    count: number;
  }[];
  otherRecipients: string;
  siteName: string;
  username: string;
  lng: string;
};

export function Join({
  unsubLink,
  course,
  newParticipant,
  roleTitle,
  roleType,
  email,
  message,
  appendCollaborationHint,
  figures,
  otherRecipients,
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
            {t("notification.join.mail.intro", "{USERNAME} just joined {COURSE} as: {ROLE}.", {
              USERNAME: newParticipant,
              COURSE: course,
              ROLE: roleTitle,
              ROLETYPE: roleType,
            })}
          </p>

          {message ? (
            <>
              <p>{t("notification.join.mail.message", "They left this message:")}</p>
              <table className="comment-box">
                <tr>
                  <td dangerouslySetInnerHTML={{ __html: message }}></td>
                </tr>
              </table>
            </>
          ) : null}
          {appendCollaborationHint ? (
            <p>
              {t(
                "notification.join.mail.collaborationHint",
                "If you like them to collaborate feel free to make contact. Give out rights to edit {COURSE} by adding people to its organization team by clicking the bullhorn next to a name.",
                { COURSE: course },
              )}
            </p>
          ) : null}
          <strong>
            {t("notification.join.mail.statsOverview", "Overview over participants:")}
          </strong>
          <p>
            {figures.map((figure) => (
              <>
                {figure.role}: {figure.count}
                <br />
              </>
            ))}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>{t("email.base.receiveNote.courseTeam", { COURSE: course })}</td>
            </tr>
            <tr>
              <td>
                {t("email.base.receiveNote.otherRecipients", { OTHERRECIPIENTS: otherRecipients })}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=joinNotify" })}>
                  {t("email.base.profileLink")}
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ paddingTop: "16px" }}>
                {t("email.base.spamPrevention", { MAIL: email })}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
