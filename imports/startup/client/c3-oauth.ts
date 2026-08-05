import { Meteor } from "meteor/meteor";
import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { Random } from "meteor/random";
// @ts-expect-error: Some error in the types of the cookies meteor package.
import { Cookies } from "meteor/ostrio:cookies";
import { Accounts } from "meteor/accounts-base";

import { C3Settings } from "/imports/startup/both/c3-oauth-settings";
import { LocalhostSsl } from "/imports/utils/LocalhostSsl";

const cookies = new Cookies();

// Some code are inspired from the voc/infobeamer-cms See: https://github.com/voc/infobeamer-cms/blob/6a133e66290d5ec86c9e9cf078f525a0b4d3b9bf/frontend.py#L188

/** Base64 encode the given Uint8Array and return a string */
function base64Encode(data: Uint8Array<ArrayBuffer>) {
  let str = "";
  for (const byte of data) {
    str += byte;
  }
  return btoa(str);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)).then((hash) =>
    // Convert to base64url encoding
    base64Encode(new Uint8Array(hash)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  );
}

// Request C3 credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
function requestCredential(
  options: { requestPermissions?: any; redirectUrl?: any },
  credentialRequestCompleteCallback: (error: ConfigError) => any,
) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === "function") {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  const config = ServiceConfiguration.configurations.findOne({
    service: "c3",
  }) as unknown as C3Settings;
  if (!config) {
    credentialRequestCompleteCallback?.(new ConfigError());
    return;
  }

  const loginStyle = OAuth._loginStyle("c3", config, options);

  // set the verifier for use on the server (Proof Key for Code Exchange, https://oauth.net/2/pkce/)
  const verifier = Random.secret();
  cookies.set("verifier", verifier);
  const challenge = generateCodeChallenge(verifier);

  const loginUrl =
    config.authorizeUrl +
    `?client_id=${config.clientId}` +
    // state is only nessecary to redirect to the place where the user was and to give some code advices how to proceed
    `&state=${OAuth._stateParam(loginStyle, verifier, (options && options.redirectUrl) || document.location.href)}` +
    "&response_type=code" +
    `&redirect_uri=${LocalhostSsl ? "https://localhost:3443/_oauth/c3" : OAuth._redirectUri("c3", config)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${challenge}`;

  OAuth.launchLogin({
    loginService: "c3",
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken: verifier,
  });
}

Accounts.oauth.registerService("c3");

function loginWithC3(options: any, callback: any) {
  // support a callback without options
  if (!callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback =
    Accounts.oauth.credentialRequestCompleteHandler(callback);
  requestCredential(options, credentialRequestCompleteCallback);
}
Accounts.registerClientLoginFunction("c3", loginWithC3);
Meteor.loginWithC3 = (...args: any) => Accounts.applyLoginFunction("c3", args);
