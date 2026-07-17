import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  group: string;
  event: JSX.Element;
  newParticipant: JSX.Element;
  companionsOfNewParticipant: number;
  participantsCount: number;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function RsvpTeam({
  group,
  event,
  newParticipant,
  companionsOfNewParticipant,
  participantsCount,
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
            {t(
              "notification.rsvp.team.mail.intro",
              '{COMPANIONS, plural, =0{{USERNAME} } other{{USERNAME} and companion } }just reserved a seat for event "{EVENT}".',
              { USERNAME: newParticipant, COMPANIONS: companionsOfNewParticipant, EVENT: event },
            )}
          </p>
          <p className="fw-bold">
            {t("notification.rsvp.team.mail.statsOverview", "Attendees now: {PARTICIPANTS}", {
              PARTICIPANTS: participantsCount,
            })}
          </p>
        </td>
      </tr>
      <Footer
        receiveNote={t("email.base.receiveNote.groupTeam", { GROUP: group })}
        unsubscribe={unsubscribe}
        spamPrevention
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
