import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { requestCredential } from "/imports/startup/both/C3OAuth/c3-oauth_client";
import "/imports/startup/both/C3OAuth/c3-oauth_server";

Accounts.oauth.registerService("c3");

if (Meteor.isClient) {
  const loginWithC3 = (options: any, callback: any) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback =
      Accounts.oauth.credentialRequestCompleteHandler(callback);
    requestCredential(options, credentialRequestCompleteCallback);
  };
  Accounts.registerClientLoginFunction("c3", loginWithC3);
  Meteor.loginWithC3 = (...args: any) => Accounts.applyLoginFunction("c3", args);
} else {
  Accounts.addAutopublishFields({
    // publish all fields including access token
    forLoggedInUser: ["services.c3"],
    forOtherUsers: ["services.c3.nickname"],
  });
}
