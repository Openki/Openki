import { Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import merge from "deepmerge";

import { Deprecated, Record, StringEnum, Type } from "/imports/utils/CustomChecks";
import { LocalizedValue, LocalizedValuePattern } from "/imports/utils/getLocalizedValue";

export const RoleEntityPattern = {
  /** A unique name for the role, e.g. "team". This is used to connect the role with i18n strings */
  type: String,
  /** Icon class string from font-awesome ex: "fa-solid fa-bullhorn" */
  icon: String,
  /**
   * The role appears as "proposed only" in the member list.
   * @default false
   */
  proposal: Match.Maybe(Boolean),
  /**
   * The role is always added to the group on creation.
   * @default false
   */
  preset: Match.Maybe(Boolean),
  /**
   * The role can be edited (added/removed to the group) after a group has been created
   * by the editors of a group.
   * @default false
   */
  editable: Match.Maybe(Boolean),
  /**
   * Each role can have custom translations.
   * You only need to include the keys you want to change.
   * If a key is not defined in your overrides, the default translation from
   * `i18n/roles/*.json` will be used instead.
   */
  translations: Match.Maybe({
    short: Match.Maybe(LocalizedValuePattern),
    subscribe: Match.Maybe(LocalizedValuePattern),
    subscribed: Match.Maybe(LocalizedValuePattern),
    description: Match.Maybe(LocalizedValuePattern),
    myList: Match.Maybe(LocalizedValuePattern),
    myListPast: Match.Maybe(LocalizedValuePattern),
    userList: Match.Maybe(LocalizedValuePattern),
    userListPast: Match.Maybe(LocalizedValuePattern),
    "find.roleNeeded": Match.Maybe(LocalizedValuePattern),
    "groupList.statusTitle.roleNeeded": Match.Maybe(LocalizedValuePattern),
    "groupList.statusTitle.roleOccupied": Match.Maybe(LocalizedValuePattern),
    "groupList.statusTitle.roleOccupiedByUser": Match.Maybe(LocalizedValuePattern),
    "notification.join.mail.subject": Match.Maybe(LocalizedValuePattern),
    "notification.join.mail.intro": Match.Maybe(LocalizedValuePattern),
    "group.firstSteps": Match.Maybe(LocalizedValuePattern),
    "group.messageInfo": Match.Maybe(LocalizedValuePattern),
    "group.history.userSubscribed": Match.Maybe(LocalizedValuePattern),
    "group.history.userUnsubscribed": Match.Maybe(LocalizedValuePattern),
  }),
};

export type RoleEntity = Type<typeof RoleEntityPattern>;

/** See `settings-example.jsonc` for full documentation */
export const PublicSettingsPattern = Match.ObjectIncluding({
  /** @default "Hmmm" */
  siteName: String,

  /**
   * The text top left at the logo
   * @default ""
   */
  siteStage: String,

  /**
   * Shows a banner saying that this is only for testing
   * @default false
   */
  testWarning: Boolean,

  /**
   * The logo in the top left corner. Can be a logo from the `/public/logo/*` folder,
   * from our s3 file storage (must start with the "publicUrlBase" setting) or
   * a base64 encoded string.
   */
  headerLogo: { src: String, alt: LocalizedValuePattern },

  /**
   * The logo in the top left corner from the `/kiosk/events/` page. Can be a logo
   * from the `/public/logo/*` folder, from our s3 file storage (must start with
   * the "publicUrlBase" setting) or a base64 encoded string.
   */
  headerLogoKiosk: { src: String, alt: LocalizedValuePattern },

  /** The default image used for avatars (color is changed using the CSS filter 'hue-rotate'). */
  avatarLogo: { src: String, alt: LocalizedValuePattern },

  /**
   * The image to be shown in social media. Can be a logo from the `/public/logo/*` folder or
   * from our s3 file storage (must start with the `"publicUrlBase"` setting).
   */
  ogLogo: { src: String },

  /**
   * Can be a logo from the `/private/*` folder, from our s3 file storage (must
   * start with the `"publicUrlBase"` setting) or a base64 encoded string.
   */
  emailLogo: String,

  /** Theming the ui */
  theme: {
    /** @default #38829c */
    brand: String,
  },

  /** IDs of the tenants that should be displayed publicly, choose at least one */
  publicTenants: [String],

  regionSelection: {
    /*
     * The minimum number of regions displayed in the Regions selection.
     * @default 5
     */
    minNumber: Number,
    /*
     * A link to a page that explains regions, if not set then none link is shown.
     * The value can be a string or a object with key & values for every language
     * eg. `{ "en": "...", "de": "...", ... }`
     */
    aboutLink: Match.Maybe(LocalizedValuePattern),
  },

  /**
   * A link to a page that give instructions how to translate.
   * @default "https://gitlab.com/Openki/Openki/-/wikis/translation"
   * Note: This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   */
  i18nHelpLink: Match.Maybe(LocalizedValuePattern),

  /** Define alternative translation files */
  i18nMapping: Match.Maybe(Match.ObjectIncluding<Record<string, string>>({})),

  matomo: Match.Maybe(
    Match.OneOf(
      {
        jsPath: String,
        phpPath: String,
      },
      {
        url: String,
        site: Match.Integer,
        jsPath: String,
        phpPath: String,
      },
    ),
  ),

  /**
   * Show only indicative prices (DE: Richtpreise)
   * @default true
   */
  pricePolicyEnabled: Boolean,

  /**
   * Ask user to receive newsletter on account registration.
   * @default true
   */
  askNewsletterConsent: Boolean,

  /**
   * Should a reminder be sent by default or not.
   * @default true
   */
  sendReminderPreset: Boolean,

  feature: {
    /** Toggle visibility of login services */
    login: {
      /** @default true */
      email: Boolean,
      /** @default false */
      google: Boolean,
      /** @default false */
      facebook: Boolean,
      /** @default false */
      github: Boolean,
      /** @default false */
      c3: Boolean,
    },

    /**
     * Allow user without password.
     * @default false
     */
    visitorUser: Boolean,

    /**
     * Allow rsvp with +1 / for two seats.
     * @default false
     */
    rsvpWithCompanions: Boolean,

    /**
     * Allow to edit whether to remind or not.
     * @default true
     */
    sendReminderIsEditable: Boolean,

    /**
     * Show a "empty" group box to propose a new group.
     * @default true
     */
    proposeGroupBox: Boolean,

    /**
     * Disable the creation of 2dSphere indexes for db entities, this allow to
     * save non geo location in db, used for CustomMapConfig.
     * @default false
     */
    disable2dSphereForLocations: Boolean,

    /**
     * Which social media buttons should be displayed, when web share api is not
     * supported from the browser.
     */
    socialMediaButtons: [
      StringEnum(
        "bluesky",
        "facebook",
        "fediverse",
        "hackernews",
        "linkedin",
        "mastodon",
        "odnoklassniki",
        "pinterest",
        "pocket",
        "reddit",
        "teams",
        "telegram",
        "tumblr",
        "twitter",
        "viber",
        "vkontakte",
        "whatsapp",
        "copy-url",
        "email",
      ),
    ],
  },

  nav: {
    /**
     * Target link when clicking on the logo
     * @default "/"
     */
    brandLink: String,

    /**
     * Show/hide find/search item in navbar
     * @default true
     */
    search: Boolean,

    /**
     * Show/hide propose item in navbar
     * @default true
     */
    proposeGroup: Boolean,

    /**
     * Show/hide calendar item in navbar
     * @default true
     */
    calendar: Boolean,

    /** @default [] */
    customEntries: [
      {
        link: String,
        /** icon from fontawesome free */
        icon: String,
        /**
         * The text from the link.
         * The value can be a translation key from i18next defined in code, a string or a object
         * with key & values for every language eg. `{ "en": "Edit", "de": "Bearbeiten", ... }`
         */
        text: Match.Maybe(LocalizedValuePattern),

        /**
         * Text from the link. The value is a translation key from i18next it must be
         * defined in code
         * @deprecated use `text` instead (May 2026)
         */
        key: Match.Maybe(Deprecated(String, 'use "text" field instead')),
      },
    ],
  },

  /**
   * Standard for all regions, can be overwritten if the "dashboard" property is
   * set in the region, if not set, the ‘find’ page is displayed
   * @default undefined
   */
  regionDashboardDefault: Match.Maybe([
    {
      /**
       * The entity to show: "group", "groupWithoutPropose", "event", "organization",
       * "eventsMap", "propose" are supported
       */
      entity: StringEnum(
        "group",
        "groupWithoutPropose",
        "event",
        "organization",
        "eventsMap",
        "propose",
      ),
      /**
       * Title to display over the row. The value can be a translation key from
       * i18next defined in code, a string or a object with key & values for
       * every language eg. `{ "en": "...", "de": "...", ... }`
       */
      title: Match.Maybe(LocalizedValuePattern),
      /**
       * Query how the data should be filtered and sorted, all options and filters
       * can be found in the wiki, can be an empty string "". The entities are
       * filtered by region.
       */
      query: Match.Maybe(String),
      /** Overwrite the standard showAll button (Optional) */
      showAll: Match.Maybe({
        /** The target to which the button links. */
        link: Match.Maybe(String),
        /**
         * The text to display. The value can be a translation key from i18next
         * defined in code, a string or a object with key & values for every language
         * eg. `{ "en": "...", "de": "...", ... }`
         */
        text: Match.Maybe(LocalizedValuePattern),
      }),
    },
  ]),

  /**
   * Standard for all organizations, can be overwritten if the "dashboard" property
   * is set in the organization, if not set, the "find" page is displayed.
   * @default undefined
   */
  organizationDashboardDefault: Match.Maybe([
    {
      /**
       * The entity to show: "group", "groupWithoutPropose", "event", "organization",
       * "eventsMap", "propose" are supported
       */
      entity: StringEnum(
        "group",
        "groupWithoutPropose",
        "event",
        "organization",
        "eventsMap",
        "propose",
      ),
      /**
       * Title to display over the row. The value can be a translation key from i18next defined
       * in code, a string or a object with key & values for every language
       * eg. `{ "en": "...", "de": "...", ... }`
       */
      title: Match.Maybe(LocalizedValuePattern),
      /**
       * Query how the data should be filtered and sorted, all options and filters can be found in
       * the wiki, can be an empty string "". The entities are filtered by region and group.
       */
      query: Match.Maybe(String),
      /** Overwrite the standard showAll button (optional) */
      showAll: Match.Maybe({
        /** The target to which the button links. */
        link: Match.Maybe(String),
        /**
         * The text to display. The value can be a translation key from i18next defined in code,
         * a string or a object with key & values for every language
         * eg. `{ "en": "...", "de": "...", ... }`
         */
        text: Match.Maybe(LocalizedValuePattern),
      }),
    },
  ]),
  /** Default roles for all regions which can be overwritten per region via the `Region.roles` property */
  defaultRoles: [RoleEntityPattern],

  /** @default [] */
  footerLinks: [
    {
      link: String,
      /**
       * The text from the link.
       * The value can be a translation key from i18next defined in code, a string or a object
       * with key & values for every language eg. `{ "en": "Edit", "de": "Bearbeiten", ... }`
       */
      text: Match.Maybe(LocalizedValuePattern),
      /**
       * Text that is shown on hover the link.
       * The value can be a translation key from i18next defined in code, a string or a object
       * with key & values for every language eg. `{ "en": "Edit", "de": "Bearbeiten", ... }`
       */
      title: Match.Maybe(LocalizedValuePattern),

      /**
       * Text from the link. The value is a translation key from i18next it must be
       * defined in code
       * @deprecated use `text` field instead (May 2026)
       */
      key: Match.Maybe(Deprecated(String, 'use "text" field instead')),
      /**
       * text that is shown on hover the link
       * @deprecated use `title` field instead (May 2026)
       */
      title_key: Match.Maybe(Deprecated(String, 'use "title" field instead')),
    },
  ],

  /*
   * Text displayed in the registration form to link to the Privacy Policy and Terms and
   * Conditions. Can be markdown.
   * @default undefined (not shown).
   * Note: This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   */
  dataProtectionLaw: Match.Maybe(LocalizedValuePattern),

  /**
   * This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   * @default "/info/faq"
   */
  faqLink: LocalizedValuePattern,

  /**
   * This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   * @default {
                en: "/info/faq#why-cant-i-charge-a-fixed-fee-as-a-mentor"
              }
   */
  pricePolicyLink: LocalizedValuePattern,

  /**
   * This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   * @default {
                en: "https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf",
                de: "https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf",
              }
   */
  groupGuideLink: LocalizedValuePattern,

  /**
   * This setting can be a string or a object with key & values for every language
   * eg. `{ "en": "...", "de": "...", ... }`
   * @default "https://about.openki.net"
   */
  aboutLink: LocalizedValuePattern,

  /**
   * Contribution to the platform. A admin can set in the userprofile that a user has contributed.
   * This shows a icon next to the username. Remove this setting to disable this feature.
   */
  contribution: Match.Maybe({
    icon: String,
    /** forbidden chars in username */
    forbiddenChars: [String],
    /**
     * This setting can be a string or a object with key & values for every language
     * eg. `{ "en": "...", "de": "...", ... }`
     */
    link: LocalizedValuePattern,
  }) as Match.Matcher<{
    icon: string;
    forbiddenChars: string[];
    link: LocalizedValue;
  }>,

  /**
   * Max characters allowed for the description-field of groups.
   * @default 15000
   */
  groupDescriptionMax: Match.Maybe(Number),

  /**
   * Max characters allowed for the description-field of events.
   * @default 15000
   */
  eventDescriptionMax: Match.Maybe(Number),

  /**
   * Categories for groups, main and/or sub categories
   * @default {}
   */
  categories: Record([String]),

  /** file storage */
  s3: {
    publicUrlBase: String,
  },
});

export type PublicSettings = Type<typeof PublicSettingsPattern>;

const defaults = {
  siteName: "Hmmm",
  siteStage: "",
  testWarning: false,
  headerLogo: { src: "", alt: "" },
  headerLogoKiosk: { src: "", alt: "" },
  avatarLogo: { src: "", alt: "" },
  ogLogo: { src: "openki_logo_2018.png" },
  theme: {
    brand: "#38829c",
  },
  publicTenants: [] as string[],
  regionSelection: { minNumber: 5, aboutLink: "" },
  i18nHelpLink: "https://gitlab.com/Openki/Openki/-/wikis/translation",
  matomo: {
    jsPath: "js/",
    phpPath: "js/",
  },
  pricePolicyEnabled: true,
  askNewsletterConsent: true,
  sendReminderPreset: true,
  feature: {
    login: { email: true, google: false, facebook: false, github: false, c3: false },
    visitorUser: false,
    rsvpWithCompanions: false,
    sendReminderIsEditable: true,
    proposeGroupBox: true,
    disable2dSphereForLocations: false,
    socialMediaButtons: [
      "bluesky",
      "facebook",
      "fediverse",
      "hackernews",
      "linkedin",
      "mastodon",
      "odnoklassniki",
      "pinterest",
      "pocket",
      "reddit",
      "teams",
      "telegram",
      "tumblr",
      "twitter",
      "viber",
      "vkontakte",
      "whatsapp",
      "copy-url",
      "email",
    ],
  },
  nav: {
    brandLink: "/",
    search: true,
    proposeGroup: true,
    calendar: true,
    customEntries: [] as { link: string; icon: string; key?: string; text?: string }[],
  },
  defaultRoles: [
    {
      type: "team",
      icon: "fa-solid fa-bullhorn",
      proposal: false,
      preset: true,
      editable: false,
    },
  ],
  footerLinks: [] as { link: string; key?: string; title_key?: string; text?: string }[],
  faqLink: "/info/faq",
  pricePolicyLink: {
    en: "/info/faq#why-cant-i-charge-a-fixed-fee-as-a-mentor",
  },
  groupGuideLink: {
    en: "https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf",
    de: "https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf",
  },
  aboutLink: "https://about.openki.net",
  groupDescriptionMax: 15000,
  eventDescriptionMax: 15000,
  categories: {},
};

const publicSettings = merge(defaults, Meteor.settings.public);

// separate merge of matomo to make jsPath and phpPath optional
publicSettings.matomo = { ...defaults.matomo, ...Meteor.settings.public.matomo };

// override default from socialMediaButtons
publicSettings.feature.socialMediaButtons =
  Meteor.settings.public.feature.socialMediaButtons ?? defaults.feature.socialMediaButtons;

publicSettings.defaultRoles = Meteor.settings.public.defaultRoles ?? defaults.defaultRoles;

if (
  !publicSettings.defaultRoles?.some(
    (role: PublicSettings["defaultRoles"][number]) => role.type === "team",
  )
) {
  throw new Error(
    "The `team` role is missing in PublicSettings.defaultRoles, and is required by the system" +
      JSON.stringify(publicSettings.defaultRoles),
  );
}

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings as PublicSettings;
