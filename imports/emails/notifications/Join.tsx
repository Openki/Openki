import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  group: JSX.Element;
  newParticipant: JSX.Element;
  roleShort: string;
  roleType: string;
  message: string | undefined;
  appendCollaborationHint: boolean;
  roleCounts: {
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
  group,
  newParticipant,
  roleShort,
  roleType,
  message,
  appendCollaborationHint,
  roleCounts,
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
            {t("notification.join.mail.intro", "{USERNAME} just joined {GROUP} as: {ROLE}.", {
              USERNAME: newParticipant,
              GROUP: group,
              ROLE: roleShort,
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
                "If you like them to collaborate feel free to make contact. You can give them rights to edit {GROUP} and make them part of the organizing team by clicking the megaphone next to a name.",
                { GROUP: group },
              )}
            </p>
          )}
          <strong>
            {t("notification.join.mail.statsOverview", "Overview over participants:")}
          </strong>
          <p>
            {roleCounts.map(({ role, count }) => (
              <>
                {role}: {count}
                <br />
              </>
            ))}
          </p>
        </td>
      </tr>
      <Footer
        receiveNote={t("email.base.receiveNote.groupTeam", { GROUP: group })}
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
