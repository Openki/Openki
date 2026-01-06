import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { Random } from "meteor/random";
import { C3Settings } from "/imports/startup/both/C3OAuth/settings";
import crypto from "crypto";
import { Cookies } from "meteor/ostrio:cookies";
import { LocalhostSsl } from "/imports/utils/LocalhostSsl";

export const cookies = new Cookies();

// Some code are inspired from the voc/infobeamer-cms See: https://github.com/voc/infobeamer-cms/blob/6a133e66290d5ec86c9e9cf078f525a0b4d3b9bf/frontend.py#L188

const generateCodeChallenge = (verifier: string): string =>
  crypto
    .createHash("sha256")
    .update(verifier, "utf8")
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

// Request C3 credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
export const requestCredential = (
  options: { requestPermissions?: any; redirectUrl?: any },
  credentialRequestCompleteCallback: (error: ConfigError) => any,
) => {
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
};
