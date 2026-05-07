if (Meteor.isDevelopment) {
  /**
   * DEV ONLY:
   * This file should be overwritten when the app is built for deployment,
   * to get actual version information like the commit hash and build date.
   *
   * The version information is shown in the footer of the web app, and stored
   * in the MongoDB collection called Version. This helps to use the correct code
   * version when restoring old DB backups.
   *
   * The VERSION global constant is injected by the Meteor build
   * and is used here: ./imports/startup/server/version.ts
   */
  VERSION = {
    basic: "v0.0.0",
    complete: "v0.0.0-000",
    branch: "definitely-not-prod",
    commit: "4real123",
    commitShort: "4real",
    commitDate: "2013-06-27",
  };
}
