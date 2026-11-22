import { Meteor } from "meteor/meteor";

/**
 * Compile-time static variable defined by `rspack.config.ts`.
 *
 * By using a static variable, all code only used for localhost SSL
 * can be removed from the production bundle.
 */
declare const __IS_LOCALHOST_SSL_ENABLED__: boolean;

export const LocalhostSsl =
  __IS_LOCALHOST_SSL_ENABLED__ &&
  (Meteor.isServer || (Meteor.isClient && document.location.host === "localhost:3443"));
