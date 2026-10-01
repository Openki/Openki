import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

export interface Props {
  type: "automatedNotifications" | "privateMessage";
  token: string;
  lng: string;
}

export function UnsubscribeLink({ token, type, lng }: Props) {
  const { t } = useTranslation(undefined, { lng });
  const { siteName } = Accounts.emailTemplates;

  switch (type) {
    case "automatedNotifications":
      return (
        <a href={Router.url("profileNotificationsUnsubscribe", { token })}>
          {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
        </a>
      );

    case "privateMessage":
      return (
        <a href={Router.url("profilePrivateMessagesUnsubscribe", { token })}>
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
