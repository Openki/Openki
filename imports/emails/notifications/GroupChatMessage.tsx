import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";
import { type GroupChatMessageEntity } from "/imports/api/group-chat-messages/group-chat-messages";

export interface Props {
  username: string;
  group: ReactNode;
  messageLink: string;
  subject: string;
  message: GroupChatMessageEntity;
  senderLink: string;
  senderName: string | undefined;
  customSiteName: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function GroupChatMessage({
  username,
  group,
  message,
  messageLink,
  senderLink,
  senderName,
  customSiteName,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
          <p>
            {t(
              "notification.groupChatMessage.mail.intro",
              "{USER} sent a message to the {ROLE} chat in {GROUP}:",
              {
                USER: <a href={senderLink}>{senderName}</a>,
                GROUP: group,
              },
            )}
          </p>
          <table className="groupChatMessage-box">
            <tr>
              <td dangerouslySetInnerHTML={{ __html: message.content }}></td>
            </tr>
          </table>

          <p>
            <p className="text-center">
              <a className="button" href={messageLink}>
                {t("notification.groupChatMessage.mail.replyButton", "Reply via {SITENAME}", {
                  SITENAME: customSiteName,
                })}
              </a>
            </p>
          </p>
        </td>
      </tr>
      <Footer
        receiveNote={t("email.base.receiveNote.groupTeam", { GROUP: group })}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
