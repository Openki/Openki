import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  username: string;
  sender: UserModel;
  senderLink: string;
  senderName: JSX.Element;
  message: string;
  senderCopy: boolean;
  siteName: string;
  fromAddress: string;
  eventTitle: JSX.Element | undefined;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function EventContactParticipants({
  username,
  sender,
  senderLink,
  senderName,
  message,
  senderCopy,
  siteName,
  fromAddress,
  eventTitle,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          {!!senderCopy && (
            <p>
              {t(
                "notification.event.contact-participants.mail.copyintro",
                "This is a copy of the message that was sent by you.",
              )}
            </p>
          )}

          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
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
      <Footer unsubscribe={unsubscribe} campaign={campaign} lng={lng} />
    </>
  );
}
