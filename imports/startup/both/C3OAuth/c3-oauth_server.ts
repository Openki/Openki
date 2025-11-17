import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";

if (Meteor.isServer) {
  OAuth.registerService("c3", 2, null, async (query: any) => {
    const response = await getTokens(query);
    const { accessToken } = response;
    const identity = await getIdentity(accessToken);

    const serviceData = {
      accessToken: OAuth.sealSecret(accessToken),
      expiresAt: +new Date() + 1000 * response.expiresIn,
      refreshToken: undefined,
    };

    Object.assign(serviceData, identity);

    // only set the token in serviceData if it's there. this ensures
    // that we don't lose old ones (since we only get this on the first
    // log in attempt)
    if (response.refreshToken) {
      serviceData.refreshToken = OAuth.sealSecret(response.refreshToken);
    }

    console.info("servicedata: " + JSON.stringify(serviceData));

    return {
      serviceData,
      options: { profile: { name: (serviceData as any).nickname } },
      // XXX use username for name until meteor accounts has a profile with a name
    };
  });

  // returns an object containing:
  // - accessToken
  // - expiresIn: lifetime of token in seconds
  // - refreshToken, if this is the first authorization request and we got a
  //   refresh token from the server
  const getTokens = async (query: { code: any }) => {
    const config = await ServiceConfiguration.configurations.findOneAsync({
      service: "c3",
    });
    if (!config) {
      throw new ConfigError();
    }

    const body = OAuth._addValuesToQueryParams({
      grant_type: "authorization_code",
      code: query.code,
      client_id: (config as any).clientId,
      client_secret: OAuth.openSecret(config.secret),
      redirect_uri: OAuth._redirectUri("c3", config),
    }).toString();

    return OAuth._fetch("https://hub.test.c3voc.de/oauth2/token", "POST", {
      headers: {
        Accept: "application/json",
        "Content-type": "application/x-www-form-urlencoded",
      },
      body,
    })
      .then((data: { json: () => any }) => data.json())
      .then((data: { error: any; access_token: any; refresh_token: any; expires_in: any }) => {
        if (data.error) {
          throw new Error(
            "Failed to complete OAuth handshake with C3. " +
              (data ? data.error : "No response data"),
          );
        }
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      })
      .catch((err: { message: any; response: any }) => {
        throw Object.assign(
          new Error(`Failed to complete OAuth handshake with C3. ${err.message}`),
          {
            response: err.response,
          },
        );
      });
  };

  const getIdentity = async (accessToken: any) => {
    return OAuth._fetch(`https://hub.test.c3voc.de/oauth2/userinfo`, "GET", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((data: { json: () => any }) => data.json())
      .catch((err: { message: string; response: any }) => {
        throw Object.assign(new Error("Failed to fetch identity from C3 " + err.message), {
          response: err.response,
        });
      });
  };

  // export const retrieveCredential = (credentialToken: any, credentialSecret: any) =>
  //   OAuth.retrieveCredential(credentialToken, credentialSecret);
}
