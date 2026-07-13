import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  group: JSX.Element;

  roleIntroduction: JSX.Element;
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
  roleIntroduction,
  message,
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
          <p className="pre">{roleIntroduction}</p>

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
          <span className="fw-bold">
            {t("notification.join.mail.statsOverview", "Overview over the interested:")}
          </span>
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
