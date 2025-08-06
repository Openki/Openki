import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import * as emailMethods from "/imports/api/emails/methods";

export function VerifyEmail() {
  const { t } = useTranslation();
  const user = useUser();
  const [sending, setSending] = useState(false);

  if (sending) {
    return (
      <div className="alert alert-success" role="alert">
        <strong>{t("profile.verifyEmail.mailOnItsWay", "Verification e-mail on its way.")}</strong>
        <br />
        {t(
          "profile.sendingVerificationMail",
          "You will be sent a verification e-mail to click shortly.",
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async (event) => {
        event.preventDefault();

        setSending(true);
        try {
          await emailMethods.sendVerificationEmail();
          Alert.success(
            t(
              "profile.sentVerificationMail",
              'Verification mail has been sent to your address: "{MAIL}".',
              { MAIL: user?.emails[0].address },
            ),
          );
        } catch (err) {
          setSending(false);
          Alert.serverError(
            err,
            t("profile.sentVerificationMail.error", "Could not send verification e-mail"),
          );
        }
      }}
    >
      <span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>&nbsp;
      {t("profile.verifymail", "Resend verification e-mail")}
    </button>
  );
}
