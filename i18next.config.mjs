import { defineConfig, recommendedAcceptedAttributes } from "i18next-cli";

export default defineConfig({
  // The English source strings are extracted from the source code.
  // Other locales are managed via Weblate and the JSON files.
  locales: ["en"],

  lint: {
    // Add custom attributes that should be linted to catch potential hardcoded strings
    acceptedAttributes: ["data-bs-title", ...recommendedAcceptedAttributes],
    checkConcatenation: "warn",
    checkPunctuationConcatenation: "warn",
    checkInterpolationParams: true,
    checkTranslationPlaceholders: "warn",
    checkTransIndices: "warn",

    ignore: [
      // Ignore emails and UI only supposed to be used by admins.
      // We might want to translate this at some point, but for now let's ignore it explicitly.
      "imports/emails/Report.tsx",
      "imports/emails/Alert.tsx",
      "imports/ui/pages/log/index.tsx",
    ],
  },

  extract: {
    // Source files to scan
    input: ["./imports/**/*.{ts,tsx}"],

    // Output path for locale files
    // This is the default, global namespace.
    output: "imports/startup/both/i18n/{{language}}.json",

    // Keep translations flat, without namespaces
    defaultNS: false,

    // Disable key and namespace separators to keep translations flat.
    keySeparator: false,
    nsSeparator: false,

    // Functions to detect during extraction
    functions: ["i18n", "t"],

    // Sort translation keys
    sort: true,

    messageFormat: "icu",
    // Enable warnings to catch and fix errors
    warnOnConflicts: "error",

    // Preserve existing dynamically generated translation keys.
    // This allows the source code to construct i18n keys during runtime,
    // and keeps the matching patterns in the translation files.
    preservePatterns: [
      // --------------------------------
      // 1) Dynamic i18n keys
      // --------------------------------

      // t(`category.${category}`)
      // t(`category.${subcategory}`)
      "category.*",

      // t(`calendar.${direction}.${unit}.${length}`)
      "calendar.*.*.*",
      // t(`calendar.${direction}.week.${length}`)
      "calendar.*.week.*",
      // t(`venue.facility.${option}`)
      "venue.facility.*",

      // --------------------------------
      // 2) Global keys
      // --------------------------------
      //
      // Some global translation keys are used without
      // a value in the source code to reduce duplication.
      // They get their values from the translation files instead.
      // We need to allowlist their keys so they don't get overwritten.

      "_button.*",
      "_inputField.maxlength",
      "_inputField.optional",
      "_inputField.password",
      "_selection.pleaseSelect",
      "_label.internal",
      "_label.singleEvent",
      "_event.state.canceled",
      "_event.state.fullyBooked",

      // --------------------------------
      // 3) Keys used in Blaze templates
      // --------------------------------
      //
      // Used in Blaze templates.
      // NOTE: Many of these should be handled by i18next-cli once we fully migrate to React.
      // These should ideally remain exact i18n keys so we can remove unused i18n keys. Do not create `preservePatterns` for them.

      "footer.aboutOpenki",
      "navigation.footer.about.title",
      "main.faq_link",
      "navigation.footer.faq.title",
      "navigation.footer.sourceCode",
      "navigation.footer.codeOnGitLab",
      "navigation.footer.powerdByOpenki",
      "main.privacyPolicy",
      "main.privacyPolicy.tooltip",
      "dashboard.calendar.showAll",
      "dashboard.userInvolvedIn.title",
      "dashboard.userRegistredFor.title",
      "dashboard.recentActivities.title",
      "dashboard.upcomingEvents.title",
      "dashboard.newProposals.title",
      "dashboard.lookingForMentors.title",
      "dashboard.lookingForVenues.title",
      "dashboard.activeOrganizations.title",
      "dashboard.eventsMap.title",
      "email.base.greeting",
      "email.base.greeting.anoym",
      "email.base.farewell",
      "email.base.postscript",
      "email.base.unexpected",
      "email.base.profileLink",
      "email.base.receiveNote.groupTeam",
      "email.base.receiveNote.otherRecipients",
      "email.base.unsubscribeLink.automatedNotifications",
      "email.base.spamPrevention",
      "adminPanel.heading",
      "adminPanel.backToDashboard",
      "adminPanel.pleaseLogin",
    ],
  },
});
