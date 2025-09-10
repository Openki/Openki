import { ValidationError } from "meteor/mdg:validation-error";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSubmit } from "../../components/buttons";
import { VerifyEmail } from "../../components/profiles/VerifyEmail";
import * as Analytics from "../../lib/analytics";
import { routerAutoscroll } from "../../lib/router-autoscroll";
import { useValidation } from "../../lib/useValidation";
import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { useUser } from "/imports/utils/react-meteor-data";

export function EmailSection() {
  const { t } = useTranslation();
  const user = useUser();
  const [isBusy, setIsBusy] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.emailAddress() || "");
  const [errors, , addError, resetErrors] = useValidation({
    noEmail: {
      text: () => t("warning.noEmailProvided", "Please enter an e-mail address."),
      field: "email",
    },
    emailNotValid: {
      text: () => t("warning.emailNotValid", "Your e-mail address seems to have an error."),
      field: "email",
    },
    emailExists: {
      text: () => t("warning.emailExists", "This e-mail address is already in use."),
      field: "email",
    },
  });

  if (!user) {
    return null;
  }

  async function handelEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetErrors();
    setIsBusy(true);
    try {
      await usersMethods.updateEmail(newEmail);
      Alert.success(t("profile.updated", "Updated profile"));
    } catch (err) {
      if (ValidationError.is(err)) {
        (err.details as any).forEach((fieldError: any) => {
          addError(fieldError.type);
        });
      }
    }
    setIsBusy(false);
  }

  async function handelNofitifcationsChange(event: React.ChangeEvent<HTMLInputElement>) {
    routerAutoscroll.cancelNext();

    const allow = event.currentTarget.checked;

    try {
      await usersMethods.updateAutomatedNotification(allow);

      Alert.success(t("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from automated notifications via profile",
        );
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.toggle.notifications.error", "Failed to change notifications"),
      );
    }
  }
  async function handelAllowPrivateMessagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    routerAutoscroll.cancelNext();

    const allow = event.currentTarget.checked;

    try {
      await usersMethods.updatePrivateMessages(allow);

      Alert.success(t("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from private messages via profile",
        );
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.toggle.allowPrivateMessages.error", "Failed to change allow direct messages"),
      );
    }
  }

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.email_settings", "E-mail settings")}</h3>
      <div className="row g-4 mb-2">
        <div className="col-sm-6">
          <form className="row g-2 mb-2" onSubmit={handelEmailChange}>
            <div className={`col ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="editform_email" className="sr-only">
                {t("profile.email", "E-mail")}
              </label>
              <input
                className="form-control"
                id="editform_email"
                type="text"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.currentTarget.value);
                }}
              />
              {!!errors.email && <span className="form-text d-block">{errors.email}</span>}
            </div>
            <div className="col-auto">
              <ButtonSubmit isBusy={isBusy} />
            </div>
          </form>
          {!user.verifiedEmailAddress() && !isBusy && <VerifyEmail />}
        </div>
        <div className="col-sm-6">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="notificationsCheck"
              checked={user.notifications}
              onChange={handelNofitifcationsChange}
            />
            <label className="form-check-label" htmlFor="notificationsCheck">
              {t("profile.toggle.notifications", "Receive automated notifications via email")}
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="allowPrivateMessagesCheck"
              checked={user.allowPrivateMessages}
              onChange={handelAllowPrivateMessagesChange}
            />
            <label className="form-check-label" htmlFor="allowPrivateMessagesCheck">
              {t(
                "profile.toggle.allowPrivateMessages",
                "Receive messages from other users (your email address will not be revealed)",
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
