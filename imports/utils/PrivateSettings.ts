import { Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { StringEnum, Type } from "./CustomChecks";
import { C3SettingsPattern } from "/imports/startup/both/c3-oauth-settings";

export const PrivateSettingsPattern = Match.ObjectIncluding({
  /**
   * User administrator accounts
   * @default []
   */
  admins: [String],

  /**
   * Pseudo-Random Number Generator. Use "static" as value to use static seed
   * for test data. Result: After test data generation, entity ids, amount of
   * events, comment content, region assignment of groups, etc will stay
   * identical. Except ids from users.
   * @default "" (random seed)
   */
  prng: StringEnum("", "static"),

  /**
   * Generates test data, is not needed for the production environment.
   * @default false
   */
  testdata: Boolean,

  /**
   * Sender e-mail address in mails
   * @default ""
   */
  siteEmail: String,

  /** "Reply to" address in mails */
  replyToEmail: Match.Maybe(String),

  /**
   * Sender and recipient address for "Report problem" function. The recipient is also
   * visible in e-mails sent to users.
   */
  reporter: {
    /**
     * The e-mail address of the sender. All e-mail addresses can be plain "sender@server.com"
     * or formatted "Sender Name <sender@server.com>"
     * @default "reporter@mail.openki.net"
     */
    sender: String,
    /**
     * Comma separated list of recipients e-mail addresses that will appear on the "To:" field
     * @default "admins@openki.net"
     */
    recipient: String,
  },

  /**
   * How many private messages each user can send per hour. If the limit is reached, the messages get blocked and an alert to is sent to the instance admins. Unless a explicit number is set, this defaults to `0` which means no limit.
   * @default: 0
   */
  numberOfPrivateMessagesPerHour: Number,

  /**
   * Tells robots/crawlers whether to index the website or not
   * @default true
   */
  robots: Boolean,

  /**
   * Tells robots/crawlers not to index user profiles (`/user/*`)
   * @default false
   */
  hideProfiles: Boolean,

  /**
   * Print the log on the server in the console, usually only for development
   * @default false
   */
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

  /** file storage */
  s3: {
    region: String,
    bucketEndpoint: String,
    accessKeyId: String,
    secretAccessKey: String,
  },

  /**
   * Maximum number of entities that the api returns. If the parameter `limit`
   * is not set in the URL, the API always returns 100 entities whatever this
   * setting is set to.
   * @default 100
   */
  apiMaxLimit: Number,

  /**
   * How many hours back notification e-mails should be sent after the server was down.
   * This helps when there was a big problem with the server to not spam people.
   * @default 72
   */
  notificationGracePeriodHours: Number,

  /** Delete entries from the log or remove critical information. The log can be viewed via `.../log` */
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
});

export type PrivateSettings = Type<typeof PrivateSettingsPattern>;

let privateSettings;

if (Meteor.isServer) {
  // See settings-example.jsonc for full documentation

  const defaults = {
    admins: [] as string[],
    prng: "",
    testdata: false,
    siteEmail: "",
    reporter: {
      sender: "reporter@mail.openki.net",
      recipient: "admins@openki.net",
    },
    numberOfPrivateMessagesPerHour: 10,
    robots: true,
    hideProfiles: false,
    printLog: false,
    apiMaxLimit: 100,
    notificationGracePeriodHours: 72,
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
