import React from "react";
import { useAccount } from "/imports/api/users/publications";

import { VisitorToUserPage } from "../visitor-to-user";
import { ResetPasswordPage } from "../reset-password";

export function HandleResetPasswordPage({ token }: { token: string }) {
  const [isLoading, user] = useAccount(token);

  if (isLoading()) {
    return null;
  }

  if (user?.privileged("visitor")) {
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
