import { Meteor } from "meteor/meteor";

/**
 * Compile-time static variable defined by `rspack.config.ts`.
 *
 * By using a static variable, all code only used for localhost SSL
 * can be removed from the production bundle.
 */
declare const isLocalhostSSLEnabled: boolean;

export const LocalhostSsl =
  isLocalhostSSLEnabled &&
  (Meteor.isServer || (Meteor.isClient && document.location.host === "localhost:3443"));
