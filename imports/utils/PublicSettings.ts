import { Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import merge from "deepmerge";

import { Record, StringEnum, Type } from "/imports/utils/CustomChecks";
import { LocalizedValue, LocalizedValuePattern } from "/imports/utils/getLocalizedValue";

// See settings-example.json.md for full documentation

export const PublicSettingsPattern = Match.ObjectIncluding({
  siteName: String,
  /** The text top left at the logo */
  siteStage: String,
  /** Shows a banner saying that this is only for testing */
  testWarning: Boolean,
  /** The logo in the top left corner */
  headerLogo: { src: String, alt: String },
  /** The logo in the top left corner from the /kiosk/events/ page. */
  headerLogoKiosk: { src: String, alt: String },
  /** The default image used for avatars */
  avatarLogo: { src: String, alt: String },
  /** The image to be shown in social media */
  ogLogo: { src: String },
  emailLogo: String,
  theme: {
    brand: String,
  },
  regionSelection: {
    /** The minimum number of regions displayed in the Regions selection. */
    minNumber: Number,
    /** A link to a page that explains regions, if not set then none link is shown. */
    aboutLink: Match.Maybe(LocalizedValuePattern),
  },
  /** A link to a page that give instructions how to translate. */
  i18nHelpLink: Match.Maybe(LocalizedValuePattern),
  i18nMapping: Match.Maybe(Match.ObjectIncluding<Record<string, string>>({})),
  publicTenants: [String],
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
  /** by true, show only indicative prices (DE: Richtpreise), default is true */
  pricePolicyEnabled: Boolean,
  /** by true, ask user to receive newsletter on account registration, default is true */
  askNewsletterConsent: Boolean,
  /** Should a reminder be sent by default or not. Default is true */
  sendReminderPreset: Boolean,
  feature: {
    /** toggle visibility of login services */
    login: { email: Boolean, google: Boolean, facebook: Boolean, github: Boolean, c3: Boolean },
    /** allow user without password */
    visitorUser: Boolean,
    /** allow rsvp with +1 / for two seats */
    rsvpWithCompanions: Boolean,
    /** allow to edit whether to remind or not, Default: true */
    sendReminderIsEditable: Boolean,
    /** show a "empty" group box to propose a new group, Default: true */
    proposeGroupBox: Boolean,
    /** disable the creation of 2dSphere indexes for db entities, this allow to save non geo location in db, used for CustomMapConfig, Default: false */
    disable2dSphereForLocations: Boolean,
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
    /** target link when clicking on the logo Default: "/" */
    brandLink: String,
    /** show/hide find/search item in navbar Default: true */
    search: Boolean,
    /** show/hide propose item in navbar Default: true */
    proposeGroup: Boolean,
    /** show/hide calendar item in navbar Default: true */
    calendar: Boolean,
    customEntries: [
      {
        link: String,
        icon: String,
        /**
         * text from the link. The value is a translation key from i18next it must be
         * defined in code
         */
        key: Match.Maybe(String),
        /** as a alternative for "key" */
        text: Match.Maybe(LocalizedValuePattern),
      },
    ],
  },
  /** Standard for all regions, can be overwritten if the "dashboard" property is set in the region, if not set, the ‘find’ page is displayed, default: undefined */
  regionDashboardDefault: Match.Maybe([
    {
      /** The entity to show: "group", "groupWithoutPropose", "event", "organization", "eventsMap", "propose" are supported */
      entity: String,
      /** Title to display over the row. The value can be a translation key from i18next defined in code, a string or a object with key & values for every language `{ "en": "...", "de": "...", ... }` */
      title: Match.Maybe(LocalizedValuePattern),
      /** Query how the data should be filtered and sorted, all options and filters can be found in the wiki. The entities are filtered by region. */
      query: Match.Maybe(String),
      /** Overwrite the standard showAll button */
      showAll: Match.Maybe({
        /** The target to which the button links. */
        link: Match.Maybe(String),
        /** The text to display. The value can be a translation key from i18next defined in code, a string or a object with key & values for every language `{ "en": "...", "de": "...", ... }` */
        text: Match.Maybe(LocalizedValuePattern),
      }),
    },
  ]),
  /** Standard for all organizations, can be overwritten if the "dashboard" property is set in the organization, if not set, the ‘find’ page is displayed, default: undefined */
  organizationDashboardDefault: Match.Maybe([
    {
      /** The entity to show: "group", "groupWithoutPropose", "event", "organization", "eventsMap", "propose" are supported */
      entity: String,
      /** Title to display over the row. The value can be a translation key from i18next defined in code, a string or a object with key & values for every language `{ "en": "...", "de": "...", ... }` */
      title: Match.Maybe(LocalizedValuePattern),
      /** Query how the data should be filtered and sorted, all options and filters can be found in the wiki. The entities are filtered by region. */
      query: Match.Maybe(String),
      /** Overwrite the standard showAll button */
      showAll: Match.Maybe({
        /** The target to which the button links. */
        link: Match.Maybe(String),
        /** The text to display. The value can be a translation key from i18next defined in code, a string or a object with key & values for every language `{ "en": "...", "de": "...", ... }` */
        text: Match.Maybe(LocalizedValuePattern),
      }),
    },
  ]),
  footerLinks: [
    {
      link: String,
      /**
       * text from the link. The value is a translation key from i18next it must be
       * defined in code
       */
      key: Match.Maybe(String),
      /** text that is shown on hover the link */
      title_key: Match.Maybe(String),
      /** as a alternative for "key" */
      text: Match.Maybe(LocalizedValuePattern),
    },
  ],
  /** Text displayed in the registration form to link to the Privacy Policy and Terms and Conditions. Can be markdown. Default: undefined (not shown) */
  dataProtectionLaw: Match.Maybe(LocalizedValuePattern),
  faqLink: LocalizedValuePattern,
  pricePolicyLink: LocalizedValuePattern,
  groupGuideLink: LocalizedValuePattern,
  aboutLink: LocalizedValuePattern,
  /** Contribution to the platform. */
  contribution: Match.Maybe({
    icon: String,
    /** forbidden chars in username */
    forbiddenChars: [String],
    link: LocalizedValuePattern,
  }) as Match.Matcher<{
    icon: string;
    forbiddenChars: string[];
    link: LocalizedValue;
  }>,
  /** Max characters allowed for the description-field of groups. */
  groupDescriptionMax: Match.Maybe(Number),
  /** Max characters allowed for the description-field of events. */
  eventDescriptionMax: Match.Maybe(Number),
  /**  Categories for groups, main and/or sub categories */
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
  regionSelection: { minNumber: 5, aboutLink: "" },
  i18nHelpLink: "https://gitlab.com/Openki/Openki/-/wikis/translation",
  publicTenants: [] as string[],
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

  footerLinks: [] as { link: string; key?: string; title_key?: string; text?: string }[],
  faqLink: "/info/faq",
  pricePolicyLink: {
    en: "/info/faq#why-can-not-i-ask-for-a-fixed-price-as-a-mentor",
    de: "/info/faq#dürfen-kurse-etwas-kosten",
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

// seperate merge of matomo to make jsPath and phpPath optional
publicSettings.matomo = { ...defaults.matomo, ...Meteor.settings.public.matomo };

// override default from socialMediaButtons
publicSettings.feature.socialMediaButtons =
  Meteor.settings.public.feature.socialMediaButtons || defaults.feature.socialMediaButtons;

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings as PublicSettings;
