import { Type } from "/imports/utils/CustomChecks";

export const C3SettingsPattern = {
  clientId: String,
  secret: String,
  authorizeUrl: String,
  tokenUrl: String,
  userInfoUrl: String,
};
export type C3Settings = Type<typeof C3SettingsPattern>;
