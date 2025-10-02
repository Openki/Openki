import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  course: JSX.Element;
  newParticipant: JSX.Element;
  roleTitle: string;
  roleType: string;
  message: string | undefined;
  appendCollaborationHint: boolean;
  figures: {
    role: string;
    count: number;
  }[];
  otherRecipients: string;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function Join({
  course,
  newParticipant,
  roleTitle,
  roleType,
  message,
  appendCollaborationHint,
  figures,
  otherRecipients,
  username,
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
            {t("notification.join.mail.intro", "{USERNAME} just joined {COURSE} as: {ROLE}.", {
              USERNAME: newParticipant,
              COURSE: course,
              ROLE: roleTitle,
              ROLETYPE: roleType,
            })}
          </p>

          {!!message && (
            <>
              <p>{t("notification.join.mail.message", "They left this message:")}</p>
              <table className="comment-box">
                <tr>
                  <td dangerouslySetInnerHTML={{ __html: message }}></td>
                </tr>
              </table>
            </>
          )}
          {appendCollaborationHint && (
            <p>
              {t(
                "notification.join.mail.collaborationHint",
                "If you like them to collaborate feel free to make contact. Give out rights to edit {COURSE} by adding people to its organization team by clicking the bullhorn next to a name.",
                { COURSE: course },
              )}
            </p>
          )}
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
      <Footer
        receiveNote={t("email.base.receiveNote.courseTeam", { COURSE: course })}
        unsubscribe={unsubscribe}
        spamPrevention={true}
        campaign={campaign}
        lng={lng}
      >
        {t("email.base.receiveNote.otherRecipients", { OTHERRECIPIENTS: otherRecipients })}
      </Footer>
    </>
  );
}
