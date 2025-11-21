import React from "react";
import { useAccount } from "/imports/api/users/publications";
import { useTranslation } from "react-i18next";

import { VisitorToUserPage } from "../visitor-to-user";
import { ResetPasswordPage } from "../reset-password";

export function HandleResetPasswordPage({ token }: { token: string }) {
  const { t } = useTranslation();
  const [isLoading, user] = useAccount(token);

  if (isLoading()) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mt-3">
        <div className="alert alert-danger display-1" role="alert">
          <i className="fa-solid fa-triangle-exclamation fa-lg fa-fw"></i>
          {t(
            "resetPassword.tokenExpired",
            "The token has expired. Start again with Reset password or Create user.",
          )}
        </div>
      </div>
    );
  }

  if (user.privileged("visitor")) {
    return (
      <VisitorToUserPage username={user.username} email={user.emailAddress() || ""} token={token} />
    );
  }

  return <ResetPasswordPage token={token} />;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("HandleResetPasswordPage", () => HandleResetPasswordPage);
