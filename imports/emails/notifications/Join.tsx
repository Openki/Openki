import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";
import { getRoleDisplay } from "/imports/utils/getRoleDisplay";

export interface Props {
  group: JSX.Element;
  newParticipant: JSX.Element;
  roleType: string;
  message: string | undefined;
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
  roleType,
  message,
  roleCounts,
  otherRecipients,
  username,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  const { roleNotificationJoinEmail } = getRoleDisplay(t);

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p className="pre">
            {roleNotificationJoinEmail(roleType, {
              USERNAME: newParticipant,
              GROUP: group,
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
