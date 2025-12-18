import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { C3Settings } from "/imports/startup/both/C3OAuth/settings";
import { Log } from "/imports/api/log/log";

if (Meteor.isServer) {
  OAuth.registerService("c3", 2, async (query: any) => {
    try {
      Log.record("login.c3", [], { name: "start" });

      const response = await getTokens(query);
      Log.record("login.c3", [], { name: "token", response });
      const { accessToken } = response;
      const identity = await getIdentity(accessToken);
      Log.record("login.c3", [], { name: "identity", identity });

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
        options: { profile: { name: (serviceData as any).username } },
      };
    } catch (e) {
      Log.record("login.c3", [], { name: "err", e });
      throw e;
    }
  });

  // returns an object containing:
  // - accessToken
  // - expiresIn: lifetime of token in seconds
  // - refreshToken, if this is the first authorization request and we got a
  //   refresh token from the server
  const getTokens = async (query: { code: any }) => {
    Log.record("login.c3", [], { name: "token.start", query });
    const config = (await ServiceConfiguration.configurations.findOneAsync({
      service: "c3",
    })) as unknown as C3Settings;
    if (!config) {
      throw new ConfigError();
    }
    Log.record("login.c3", [], { name: "token._addValuesToQueryParams", config });

    const body = OAuth._addValuesToQueryParams({
      grant_type: "authorization_code",
      code: query.code,
      client_id: config.clientId,
      client_secret: OAuth.openSecret(config.secret),
      redirect_uri: OAuth._redirectUri("c3", config),
    }).toString();

    Log.record("login.c3", [], { name: "fetch" , body});
    return OAuth._fetch(config.tokenUrl, "POST", {
      headers: {
        Accept: "application/json",
        "Content-type": "application/x-www-form-urlencoded",
      },
      body,
    })
      .then((data: { json: () => any }) => {
        Log.record("login.c3", [], { name: "fetch.result1", data });
        return data.json();
      })
      .then((data: { error: any; access_token: any; refresh_token: any; expires_in: any }) => {
        Log.record("login.c3", [], { name: "fetch.result2", data });
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
        Log.record("login.c3", [], { name: "fetch.error", err });

        throw Object.assign(
          new Error(`Failed to complete OAuth handshake with C3. ${err.message}`),
          {
            response: err.response,
          },
        );
      });
  };

  const getIdentity = async (accessToken: any) => {
    const config = (await ServiceConfiguration.configurations.findOneAsync({
      service: "c3",
    })) as unknown as C3Settings;
    if (!config) {
      throw new ConfigError();
    }

    return OAuth._fetch(config.userInfoUrl, "GET", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((data: { json: () => any }) => data.json())
      .catch((err: { message: string; response: any }) => {
        throw Object.assign(new Error("Failed to fetch identity from C3 " + err.message), {
          response: err.response,
        });
      });
  };
}
