import { ValidationError } from "meteor/mdg:validation-error";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Buttons";
import { VerifyEmail } from "../../components/profiles/VerifyEmail";
import * as Analytics from "../../lib/analytics";
import { routerAutoscroll } from "../../lib/router-autoscroll";
import { useValidation } from "/imports/ui/hooks/useValidation";
import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { useUser } from "/imports/utils/react-meteor-data";
import { FormControl } from "/imports/ui/components/form-control";
import { FormCheck } from "/imports/ui/components/FormCheck";

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

  async function handleEmailChange(event: React.SubmitEvent<HTMLFormElement>) {
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

  async function handleNofitifcationsChange(allow: boolean) {
    routerAutoscroll.cancelNext();

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
  async function handleAllowPrivateMessagesChange(allow: boolean) {
    routerAutoscroll.cancelNext();

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
    <div data-test="email-section" className="page-component page-component-seperated">
      <h3>{t("profile.email_settings", "E-mail settings")}</h3>
      <p>
        {!user.emailAddress() &&
          t("profile.email_settings.hint", "Add your email address to get notifications.")}
      </p>
      <div className="row g-4 mb-2">
        <div className="col-sm-6">
          <form className="row g-2 mb-2" noValidate onSubmit={handleEmailChange}>
            <div className="col">
              <FormControl
                id="profile-email-address"
                type="text"
                value={newEmail}
                onChange={(value) => setNewEmail(value)}
                label={t("profile.email", "E-mail")}
                error={errors.email}
              />
            </div>
            <div className="col-auto">
              {/* only for spacing */}
              <div className="form-label">&nbsp;</div>
              <Button
                id="profile-email-save"
                submit
                className="btn-cancel"
                isBusy={isBusy}
                busyText={t("_button.saving", "Saving…")}
              >
                {t("_button.save")}
              </Button>
            </div>
          </form>
          {user.emailAddress() &&
            !isBusy &&
            (user.verifiedEmailAddress() ? (
              <span className="badge text-bg-success mt-1">
                {t("profile.email.verified_indication", "Verified")}
              </span>
            ) : (
              <>
                <span className="badge text-bg-danger mt-1">
                  {t("profile.email.unverified_indication", "Unverified")}
                </span>
                <span className="ms-3">
                  <VerifyEmail />
                </span>
              </>
            ))}
        </div>
        <div className="col-sm-6">
          <div className="mb-2">
            <FormCheck
              id="profile-email-notifications"
              type="switch"
              label={t("profile.toggle.notifications", "Receive automated notifications via email")}
              checked={user.notifications}
              onChange={handleNofitifcationsChange}
            />
          </div>
          <FormCheck
            id="profile-email-allowPrivateMessage"
            type="switch"
            label={t(
              "profile.toggle.allowPrivateMessages",
              "Receive email notifications for direct messages from other users. (Your email address will not be revealed)",
            )}
            checked={user.allowPrivateMessages}
            onChange={handleAllowPrivateMessagesChange}
          />
        </div>
      </div>
    </div>
  );
}
