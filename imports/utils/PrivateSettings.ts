import { Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { StringEnum, Type } from "./CustomChecks";
import { C3SettingsPattern } from "/imports/startup/both/C3OAuth/settings";

export const PrivateSettingsPattern = Match.ObjectIncluding({
  /** User Administrator Accounts */
  admins: [String],
  /** Pseudo-Random Number Generator */
  prng: StringEnum("", "static"),
  /** Generates test data, is not needed for the productive system */
  testdata: Boolean,
  /** Sender e-mail address in mails */
  siteEmail: String,
  /** "Reply to" address in mails */
  replyToEmail: Match.Maybe(String),
  /**
   * Sender and recipient address for "Report problem" function. The recipient is also
   * visible in e-mail that are send to users.
   */
  reporter: {
    /**
     * The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com'
     * or formatted 'Sender Name sender@server.com'
     */
    sender: String,
    /** Comma separated list of recipients e-mail addresses that will appear on the To: field */
    recipient: String,
  },
  /** Tells robots/crawlers whether to index the website or not */
  robots: Boolean,
  /** Tells robots/crawlers not to index user profiles (/user/*) */
  hideProfiles: Boolean,
  /** Print the log on the server in the console, usually only for development */
  printLog: Boolean,
  /** OAuth */
  service: Match.Maybe({
    facebook: {
      appId: String,
      secret: String,
    },
    github: {
      clientId: String,
      secret: String,
    },
    google: {
      clientId: String,
      secret: String,
    },
    c3: C3SettingsPattern,
  }),
  /** Delete entries from the log or remove critical information */
  scrub: Match.Maybe([
    {
      name: String,
      comment: Match.Maybe(String),
      grace: Number,
      select: Object,
      remove: Match.Maybe(Boolean),
      unset: Match.Maybe([String]),
    },
  ]),
  /** file storage */
  s3: {
    region: String,
    bucketEndpoint: String,
    accessKeyId: String,
    secretAccessKey: String,
  },
  startup: {
    /**
     * Build the cache in the db async or sync. For larger databases it takes a
     * long time until all fields are updated, during this time the startup is blocked.
     * The users cannot use the website. Because in a normal startup the database
     * already has these fields, this task can also be done async every sunday at 22:30.
     */
    buildDbCacheAsync: Boolean,
  },
  /** Maximum number of entities that the api returns. */
  apiMaxLimit: Number,
});

export type PrivateSettings = Type<typeof PrivateSettingsPattern>;

let privateSettings;

if (Meteor.isServer) {
  // See settings-example.json.md for full documentation

  const defaults = {
    admins: [] as string[],
    prng: "",
    testdata: false,
    siteEmail: "",
    reporter: {
      sender: "reporter@mail.openki.net",
      recipient: "admins@openki.net",
    },
    robots: true,
    hideProfiles: false,
    printLog: false,
    startup: { buildDbCacheAsync: false },
    apiMaxLimit: 100,
  };

  // none deep merge
  privateSettings = { ...defaults, ...Meteor.settings, ...{ public: undefined } };
}

/**
 * Get access to some private settings from the `Meteor.settings` enriched with default values.
 *
 * Only available on the server.
 */
export const PrivateSettings = privateSettings as unknown as PrivateSettings;
