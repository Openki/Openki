import React from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./Footer";
import { Props as UnsubscribeLinkProps } from "./UnsubscribeLink";

export type Props = {
  sender: UserModel;
  senderLink: string;
  message: string;
  senderCopy: boolean;
  recipientName: string;
  siteName: string | undefined;
  fromAddress: string;
  course: React.JSX.Element | undefined;
  event: React.JSX.Element | undefined;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
};

export function PrivateMessage({
  sender,
  senderLink,
  message,
  senderCopy,
  recipientName,
  siteName,
  fromAddress,
  course,
  event,
  unsubscribe,
  campaign,
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
                "notification.privateMessage.mail.copyintro",
                'This is a copy of your message that was sent to "{RECIPIENT}"',
                { RECIPIENT: recipientName },
              )}
            </p>
          ) : null}

          <h5 className="title">{t("email.base.greeting", { USERNAME: recipientName })}</h5>
          <p>
            {t("notification.privateMessage.mail.intro", "You got a private message from:")}
            <a href={senderLink}>{sender.getDisplayName()}</a>

            {fromAddress ? <a href={`mailto:${fromAddress}`}>{fromAddress}</a> : null}
          </p>
          {course ? (
            <p>
              {t(
                "notification.privateMessage.mail.fromCourse",
                "This message was sent from {COURSE}.",
                { COURSE: course },
              )}
            </p>
          ) : null}

          {event ? (
            <p>
              {t(
                "notification.privateMessage.mail.fromEvent",
                "This message was sent from {EVENT}.",
                { EVENT: event },
              )}
            </p>
          ) : null}

          <table className="comment-box">
            <tr>
              <td dangerouslySetInnerHTML={{ __html: message }}></td>
            </tr>
          </table>

          {fromAddress ? (
            <>
              <p className="text-center">
                <a className="button" href={senderLink}>
                  {t("notification.privateMessage.mail.replyButton", "Reply over {SITENAME}", {
                    SITENAME: siteName,
                  })}
                </a>
              </p>
              <p className="text-center">
                {t(
                  "notification.privateMessage.mail.direct.answerText",
                  "You can also send {SENDERNAME} an email directly  by clicking reply in your email client",
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
                {t("notification.privateMessage.mail.replyButton.simple", "Reply")}
              </a>
            </p>
          )}
        </td>
      </tr>
      <Footer unsubscribe={unsubscribe} campaign={campaign} lng={lng} />
    </>
  );
}
