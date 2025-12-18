import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
// import { Random } from "meteor/random";
import { C3Settings } from "/imports/startup/both/C3OAuth/settings";
import crypto from "crypto";

// const generateCodeVerifier = (): string => crypto.randomBytes(32).toString("base64");

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

  const verifier = "a"; //generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const loginUrl =
    config.authorizeUrl +
    `?client_id=${config.clientId}` +
    `&state=${OAuth._stateParam(loginStyle, verifier, options && options.redirectUrl)}`+
    "&response_type=code" +
    `&redirect_uri=${OAuth._redirectUri("c3", config)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${challenge}`;

  OAuth.launchLogin({
    loginService: "c3",
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken: verifier,
    // popupOptions: { width: 900, height: 620 },
  });
};
