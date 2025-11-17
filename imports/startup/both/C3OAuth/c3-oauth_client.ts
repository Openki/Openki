import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { Random } from "meteor/random";

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

  const config = ServiceConfiguration.configurations.findOne({ service: "c3" });
  if (!config) {
    credentialRequestCompleteCallback?.(new ConfigError());
    return;
  }

  const credentialToken = Random.secret();

  const loginStyle = OAuth._loginStyle("c3", config, options);

  const loginUrl =
    "https://hub.test.c3voc.de/oauth2/authorize" +
    `?client_id=${(config as any).clientId}` +
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
