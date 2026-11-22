import { useTranslation } from "react-i18next";
import { Accounts } from "meteor/accounts-base";
import {
  getUnsubscribeURL,
  type NotificationUnsubscribeType,
} from "/imports/startup/server/emails/unsubscribe-helpers";

export interface Props {
  type: NotificationUnsubscribeType;
  token: string;
  lng: string;
}

export function UnsubscribeLink({ token, type, lng }: Props) {
  const { t } = useTranslation(undefined, { lng });
  const { siteName } = Accounts.emailTemplates;

  const unsubscribeURL = getUnsubscribeURL(type, token);

  switch (type) {
    case "automatedNotifications":
      return (
        <a href={unsubscribeURL}>
          {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
        </a>
      );

    case "privateMessage":
      return (
        <a href={unsubscribeURL}>
          {t(
            "email.base.unsubscribeLink.privateMessage",
            "Unsubscribe from email notifications for all direct messages from other users.",
            { SITENAME: siteName },
          )}
        </a>
      );

    default:
      throw new Error(`Unexpected type: "${type}"`);
  }
}
