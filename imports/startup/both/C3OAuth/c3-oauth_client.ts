import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { Random } from "meteor/random";
import { C3Settings } from "/imports/startup/both/C3OAuth/settings";

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

  const credentialToken = Random.secret();

  const loginStyle = OAuth._loginStyle("c3", config, options);

  const loginUrl =
    config.authorizeUrl +
    `?client_id=${config.clientId}` +
    "&response_type=code" +
    `&redirect_uri=${OAuth._redirectUri("c3", config)}` +
    `&state=${OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)}`;

  OAuth.launchLogin({
    loginService: "c3",
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken,
    popupOptions: { width: 900, height: 620 },
  });
};
