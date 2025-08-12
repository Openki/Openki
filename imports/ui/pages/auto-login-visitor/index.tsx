import React, { useEffect } from "react";
import { Router } from "meteor/iron:router";
import { Random } from "meteor/random";

import { AccountsAsync } from "/imports/utils/promisify";
import { useAccount } from "/imports/api/users/publications";

import { TokenExpired } from "../../components/TokenExpired";

export interface Props {
  email: string;
  token: string;
}

export function AutoLoginVisitorPage({ token, email }: Props) {
  const [isLoading, user] = useAccount(token);

  useEffect(() => {
    if (!user) {
      AccountsAsync.resetPassword(token, Random.secret());
      Router.go("home");
    }
  });

  if (isLoading()) {
    return null;
  }

  if (!user) {
    return <TokenExpired email={email} />;
  }

  return null;
}

// for Blaze
import "./template.html";

Template.registerHelper("AutoLoginVisitorPage", () => AutoLoginVisitorPage);
