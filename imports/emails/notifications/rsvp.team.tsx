import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

export type Props = {
  unsubLink: string;
  course: string;
  event: JSX.Element;
  newParticipant: JSX.Element;
  companionsOfNewParticipant: number;
  participantsCount: number;
  email: JSX.Element;
  siteName: string;
  username: string;
  lng: string;
};

export function RsvpTeam({
  unsubLink,
  course,
  event,
  newParticipant,
  companionsOfNewParticipant,
  participantsCount,
  email,
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
            {t(
              "notification.rsvp.team.mail.intro",
              '{COMPANIONS, plural, =0{{USERNAME} } other{{USERNAME} and companion } }just reserved a seat for event "{EVENT}".',
              { USERNAME: newParticipant, COMPANIONS: companionsOfNewParticipant, EVENT: event },
            )}
          </p>
          <p>
            <strong>
              {t("notification.rsvp.team.mail.statsOverview", "Attendees now: {PARTICIPANTS}", {
                PARTICIPANTS: participantsCount,
              })}
            </strong>
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
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=rsvpTeamNotify" })}>
                  {t("email.base.profileLink")}
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ paddingTop: "16px;" }}>
                {t("email.base.spamPrevention", { MAIL: email })}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
