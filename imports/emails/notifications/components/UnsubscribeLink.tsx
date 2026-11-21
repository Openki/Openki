import { useTranslation } from "react-i18next";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import type { NotificationType } from "/imports/startup/server/routes";

export interface Props {
  type: "automatedNotifications" | "privateMessage";
  token: string;
  lng: string;
}

/**
 * API endpoint path segments that should match the ones
 * defined in `imports/startup/server/routes.ts`
 */
const unsubscribePaths: Record<Props["type"], NotificationType> = {
  automatedNotifications: "notifications",
  privateMessage: "privatemessages",
};

export type NotificationUnsubscribeType = keyof typeof unsubscribePaths;

function getUnsubscribeURL(type: Props["type"], token: Props["token"]) {
  const path = unsubscribePaths[type];
  if (!path) {
    throw new Error("Missing unsubscribe path for type", { cause: { type, token } });
  }
  const url = new URL(
    `/profile/${path}/unsubscribe/${encodeURIComponent(token)}`,
    Meteor.absoluteUrl(),
  );
  return url.toString();
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
