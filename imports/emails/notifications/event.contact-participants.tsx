import React from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Router } from "meteor/iron:router";

export type Props = {
  username: string;
  unsubLink: string;
  sender: UserModel;
  senderLink: string;
  senderName: JSX.Element;
  message: string;
  senderCopy: boolean;
  siteName: string;
  fromAddress: string;
  eventTitle: React.JSX.Element | undefined;
  lng: string;
};

export function EventContactParticipants({
  username,
  unsubLink,
  sender,
  senderLink,
  senderName,
  message,
  senderCopy,
  siteName,
  fromAddress,
  eventTitle,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          {senderCopy ? (
            <p>
              {t(
                "notification.event.contact-participants.mail.copyintro",
                "This is a copy of the message that was sent by you.",
              )}
            </p>
          ) : null}

          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {t(
              "notification.event.contact-participants.mail.intro",
              '{SENDERNAME} sent a message to you and all attendees of the event "{EVENT}"',
              { SENDERNAME: senderName, EVENT: eventTitle },
            )}
          </p>
          <table className="comment-box">
            <tr>
              <td dangerouslySetInnerHTML={{ __html: message }}></td>
            </tr>
          </table>
          {fromAddress ? (
            <>
              <p className="text-center">
                <a className="button" href={senderLink}>
                  {t(
                    "notification.event.contact-participants.mail.replyButton",
                    "Reply over {SITENAME}",
                    { SITENAME: siteName },
                  )}
                </a>
              </p>
              <p className="text-center">
                {t(
                  "notification.event.contact-participants.mail.direct.answerText",
                  "You can also send {SENDERNAME} an email directly by clicking reply in your email client",
                  { SENDERNAME: sender.getDisplayName() },
                )}
                <br />
                <br />
                <a className="text-center" href={`mailto:${fromAddress}`}>
                  {fromAddress}
                </a>
              </p>
            </>
          ) : (
            <p className="text-center">
              <a className="button" href={senderLink}>
                {t("notification.event.contact-participants.mail.replyButton.simple", "Reply")}
              </a>
            </p>
          )}
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                <a href={unsubLink}>
                  {t(
                    "notification.event.contact-participants.mail.unsubLink",
                    "Unsubscribe from all private messages from users.",
                    { SITENAME: siteName },
                  )}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=eventContactParticipants" })}>
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
