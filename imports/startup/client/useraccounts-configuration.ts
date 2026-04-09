import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";

Accounts.onEmailVerificationLink((tokenEmail: string) => {
  const [token, email] = tokenEmail.split("?email=");
  Accounts.verifyEmail(token, (error) => {
    if (!error) {
      Router.go("profile", undefined, { query: { verifyEmail: "success" } });
    } else {
      Router.go("profile", undefined, { query: { verifyEmail: "failed", email } });
    }
  });
});
