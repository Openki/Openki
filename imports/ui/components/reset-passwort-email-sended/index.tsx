import React from "react";
import { useTranslation } from "react-i18next";
import { ActionResult } from "../ActionResult";

export function ResetPasswortEmailSended() {
  const { t } = useTranslation();

  return (
    <ActionResult
      type="success"
      icon={<i className="fa-regular fa-envelope fa-fw"></i>}
      title={t("resetPasswort.sendEmail.title", "Check your e-mail inbox.")}
      report={true}
    >
      {t(
        "resetPasswort.sendEmail",
        "An e-mail with further instructions on how to reset your password, login or create your user account has been sent to you. It may take a few minutes for the email to appear in your inbox. Please also check your spam folder.",
      )}
    </ActionResult>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("ResetPasswortEmailSended", () => ResetPasswortEmailSended);
