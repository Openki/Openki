import { ServiceConfiguration, ConfigError } from "meteor/service-configuration";
import { WebApp } from "meteor/webapp";
import { LocalhostSsl } from "/imports/utils/LocalhostSsl";
import { Accounts } from "meteor/accounts-base";
import { AsyncLocalStorage } from "node:async_hooks";

import { C3Settings } from "/imports/startup/both/c3-oauth-settings";

if (LocalhostSsl) {
  OAuth._checkRedirectUrlOrigin = () => false;
}

const requestContext = new AsyncLocalStorage<{ request: { cookies: Record<string, string> } }>();

// save the request context for later to have access to the cookies
WebApp.handlers.use("/_oauth/c3", (request, _response, next) => {
  requestContext.run({ request }, () => next());
});

OAuth.registerService("c3", 2, null, async (query: any) => {
  const response = await getTokens(query);
  const { accessToken } = response;
  const identity = await getIdentity(accessToken);

  const serviceData = {
    accessToken: OAuth.sealSecret(accessToken),
    expiresAt: Date.now() + 1000 * response.expiresIn,
    refreshToken: undefined,
  };

  Object.assign(serviceData, identity, { id: identity.username });

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
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request and we got a
//   refresh token from the server
async function getTokens(query: { code: any }) {
  const config = (await ServiceConfiguration.configurations.findOneAsync({
    service: "c3",
  })) as unknown as C3Settings;
  if (!config) {
    throw new ConfigError();
  }

  const body = OAuth._addValuesToQueryParams({
    grant_type: "authorization_code",
    code: query.code,
    client_id: config.clientId,
    client_secret: OAuth.openSecret(config.secret),
    redirect_uri: LocalhostSsl
      ? "https://localhost:3443/_oauth/c3"
      : OAuth._redirectUri("c3", config),
    // read out the verifier set on the client (Proof Key for Code Exchange, https://oauth.net/2/pkce/)
    code_verifier: requestContext.getStore()?.request.cookies.verifier,
  }).toString();

  return OAuth._fetch(config.tokenUrl, "POST", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
    .then((data: Response) => {
      if (!data.ok) {
        throw Object.assign(new Error(`${data.status}: ${data.statusText}`), {
          response: data,
        });
      }

      return data.json();
    })
    .then((data: { error: any; access_token: any; refresh_token: any; expires_in: any }) => {
      if (data.error) {
        throw new Error(
          "Failed to complete OAuth handshake with C3. " + (data ? data.error : "No response data"),
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    })
    .catch((err: { message: string; response: Response }) => {
      throw Object.assign(new Error(`Failed to complete OAuth handshake with C3. ${err.message}`), {
        response: err.response,
      });
    });
}

async function getIdentity(accessToken: any) {
  const config = (await ServiceConfiguration.configurations.findOneAsync({
    service: "c3",
  })) as unknown as C3Settings;
  if (!config) {
    throw new ConfigError();
  }

  return OAuth._fetch(config.userInfoUrl, "GET", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then((data: { json: () => any }) => {
      return data.json();
    })
    .catch((err: { message: string; response: any }) => {
      throw Object.assign(new Error("Failed to fetch identity from C3 " + err.message), {
        response: err.response,
      });
    });
}

Accounts.oauth.registerService("c3");

Accounts.addAutopublishFields({
  // publish all fields including access token
  forLoggedInUser: ["services.c3"],
  forOtherUsers: ["services.c3.username"],
});
