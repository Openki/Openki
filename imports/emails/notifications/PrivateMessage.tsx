import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  sender: UserModel;
  senderLink: string;
  message: string;
  senderCopy: boolean;
  recipientName: string;
  siteName: string | undefined;
  fromAddress: string;
  shouldShowPMWarning: boolean;
  group: JSX.Element | undefined;
  event: JSX.Element | undefined;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function PrivateMessage({
  sender,
  senderLink,
  message,
  senderCopy,
  recipientName,
  siteName,
  fromAddress,
  shouldShowPMWarning,
  group,
  event,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  return (
    <>
      {senderCopy && (
        <tr className="alert">
          <td>
            {t(
              "notification.privateMessage.mail.copyintro",
              'This is a copy of your message that was sent to "{RECIPIENT}".',
              { RECIPIENT: recipientName },
            )}
          </td>
        </tr>
      )}
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: recipientName })}</h5>
          <p>
            {t(
              "notification.privateMessage.mail.intro",
              "You got a direct message from {USERTYPE}",
              {
                USERTYPE: (
                  <span className="fw-bold">
                    {sender.hasPrivilege("admin")
                      ? t("notification.privateMessage.mail.fromAdmin", "an admin")
                      : t("notification.privateMessage.mail.fromUser", "a regular user")}
                  </span>
                ),
              },
            )}
            .
          </p>
          {shouldShowPMWarning && (
            <p>
              {t(
                "notification.privateMessage.mail.warning",
                "Please make sure you trust this user, and be careful to check links before you open them.",
              )}
            </p>
          )}
          <p>
            {t("notification.privateMessage.mail.userWrote", "{USER} wrote:", {
              USER: (
                <>
                  <a href={senderLink}>{sender.getDisplayName()}</a>
                  {!!fromAddress && (
                    <>
                      {" "}
                      (<a href={`mailto:${fromAddress}`}>{fromAddress}</a>)
                    </>
                  )}
                </>
              ),
            })}
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
                  {t("notification.privateMessage.mail.replyButton", "Reply over {SITENAME}", {
                    SITENAME: siteName,
                  })}
                </a>
              </p>
              <p className="text-center">
                {t(
                  "notification.privateMessage.mail.direct.answerText",
                  "You can also send {SENDERNAME} an email directly by clicking reply in your email client.",
                  { SENDERNAME: sender.getDisplayName() },
                )}
              </p>
            </>
          ) : (
            <p className="text-center">
              <a className="button" href={senderLink}>
                {t("notification.privateMessage.mail.replyButton.simple", "Reply")}
              </a>
            </p>
          )}

          {!!group && (
            <p>
              {t(
                "notification.privateMessage.mail.fromGroup",
                "This message was sent from {GROUP}.",
                { GROUP: group },
              )}
            </p>
          )}
          {!!event && (
            <p>
              {t(
                "notification.privateMessage.mail.fromEvent",
                "This message was sent from {EVENT}.",
                { EVENT: event },
              )}
            </p>
          )}
        </td>
      </tr>
      <Footer unsubscribe={unsubscribe} campaign={campaign} lng={lng} />
    </>
  );
}
