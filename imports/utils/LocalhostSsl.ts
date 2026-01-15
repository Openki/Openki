export const LocalhostSsl =
  (Meteor.isServer && process.env.OPENKI_LOCALHOST_SSL === "1") ||
  (Meteor.isClient && document.location.host === "localhost:3443");
