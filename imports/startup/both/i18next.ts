import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import ICU from "i18next-icu";
import ChainedBackend from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { LanguagesRaw } from "/imports/api/languages/languages";
import { Blaze, Handlebars } from "meteor/blaze";
import { Spacebars } from "meteor/spacebars";
import { Template } from "meteor/templating";
import { initReactI18next } from "react-i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";

// oxlint-disable-next-line no-constant-condition
if (false) {
  // Allowlist: This is needed for meteor's dynamic-import module, to allow dynamic loading of modules
  // on the client: https://docs.meteor.com/packages/dynamic-import.html#Using-import-with-dynamic-expressions
  import("/imports/startup/both/i18n/en.json");
  import("/imports/startup/both/i18n/roles/en.json");

  // common namespace
  import("/imports/startup/both/i18n/en-ccc.json");
  import("/imports/startup/both/i18n/af.json");
  import("/imports/startup/both/i18n/am.json");
  import("/imports/startup/both/i18n/ar.json");
  import("/imports/startup/both/i18n/da.json");
  import("/imports/startup/both/i18n/de.json");
  import("/imports/startup/both/i18n/de-ccc.json");
  import("/imports/startup/both/i18n/de-ZH.json");
  import("/imports/startup/both/i18n/de-zuerich-lernt.json");
  import("/imports/startup/both/i18n/el.json");
  import("/imports/startup/both/i18n/es.json");
  import("/imports/startup/both/i18n/fa.json");
  import("/imports/startup/both/i18n/fr.json");
  import("/imports/startup/both/i18n/hu.json");
  import("/imports/startup/both/i18n/it.json");
  import("/imports/startup/both/i18n/ja.json");
  import("/imports/startup/both/i18n/ko.json");
  import("/imports/startup/both/i18n/nb.json");
  import("/imports/startup/both/i18n/nl.json");
  import("/imports/startup/both/i18n/pt.json");
  import("/imports/startup/both/i18n/rm.json");
  import("/imports/startup/both/i18n/ru.json");
  import("/imports/startup/both/i18n/sv.json");
  import("/imports/startup/both/i18n/tr.json");
  import("/imports/startup/both/i18n/zh-CN.json");
  import("/imports/startup/both/i18n/zh-TW.json");

  // roles namespace
  import("/imports/startup/both/i18n/roles/en-ccc.json");
  import("/imports/startup/both/i18n/roles/ar.json");
  import("/imports/startup/both/i18n/roles/da.json");
  import("/imports/startup/both/i18n/roles/de.json");
  import("/imports/startup/both/i18n/roles/de-ccc.json");
  import("/imports/startup/both/i18n/roles/de-ZH.json");
  import("/imports/startup/both/i18n/roles/de-zuerich-lernt.json");
  import("/imports/startup/both/i18n/roles/el.json");
  import("/imports/startup/both/i18n/roles/es.json");
  import("/imports/startup/both/i18n/roles/fa.json");
  import("/imports/startup/both/i18n/roles/fr.json");
  import("/imports/startup/both/i18n/roles/hu.json");
  import("/imports/startup/both/i18n/roles/it.json");
  import("/imports/startup/both/i18n/roles/ko.json");
  import("/imports/startup/both/i18n/roles/nb.json");
  import("/imports/startup/both/i18n/roles/pt.json");
  import("/imports/startup/both/i18n/roles/ru.json");
  import("/imports/startup/both/i18n/roles/sv.json");
  import("/imports/startup/both/i18n/roles/tr.json");
}

let localStorageSupported;
try {
  localStorage.setItem("test1234", "test1234");
  localStorage.removeItem("test1234");
  localStorageSupported = true;
} catch {
  // not allowed
  localStorageSupported = false;
}

const backends = [];

if (localStorageSupported) {
  // we use localstorage to cache translations for 1 hour  (see: backendOptions:expirationTime below)
  backends.push(LocalStorageBackend);
}

// and only load translations for the languages and namespaces we need
backends.push(
  resourcesToBackend(async (language: string, namespace: string) => {
    if (namespace === "common") {
      // NOTE: We simulate a "common" namespace to make it consistent with newer, namespaced
      // translations, like for example roles.
      const customLanguageCode = PublicSettings.i18nMapping?.[language];
      if (customLanguageCode) {
        // when there is a mapping we use the original language as fallback
        const customLanguageFile = await import(
          `/imports/startup/both/i18n/${customLanguageCode}.json`
        );
        const fallbackLanguageFile = await import(`/imports/startup/both/i18n/${language}.json`);
        return {
          default: {
            ...fallbackLanguageFile.default,
            ...customLanguageFile.default,
          },
        };
      } else {
        return import(`/imports/startup/both/i18n/${language}.json`);
      }
    }
    return import(`/imports/startup/both/i18n/${namespace}/${language}.json`);
  }),
);

i18next
  .use(ICU)
  .use(ChainedBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    ns: ["common", "roles"],
    defaultNS: "common",
    backend: {
      backends,
      backendOptions: [
        {
          // Disable translation caching during development
          expirationTime: Meteor.isDevelopment ? 0 : 60 * 60 * 1000, // 1 hour
        },
      ],
    },
    react: {
      useSuspense: false,
    },
  });

if (Meteor.isServer) {
  // on the server we pre load all languages.
  i18next.loadLanguages(Object.keys(LanguagesRaw));
}

/**
 * A reactive store that changed after a lang has changed and is ready (eg. after resource loading).
 * It is used to update strings in the ui after without reloading the page.
 *
 * This does not store the current language, and is only used to force updates.
 */
const reactiveLang = new ReactiveVar(Date.now());
i18next.on("languageChanged", function () {
  reactiveLang.set(Date.now());
});
i18next.on("loaded", function () {
  reactiveLang.set(Date.now());
});

/**
 * A reactive wrapper for i18next.t. Use { escapeText: true } to escape the i18n text. You can use
 * Spacebars.SafeString(..) for params to allow some HTML.
 */
export const i18n = (...args: any[]) => {
  reactiveLang.get();
  const result = (i18next.t as any)(...args);

  let escapeText: boolean;
  if (args.length === 2) {
    escapeText = args[1].escapeText || false;
  } else if (args.length === 3) {
    escapeText = args[2].escapeText || false;
  } else {
    escapeText = false;
  }

  if (Array.isArray(result)) {
    // in some cases we get a string[] array back but we expect a string
    return result
      .map((s) => {
        if (s instanceof Handlebars.SafeString) {
          return s;
        }

        return escapeText !== false ? Blaze._escape(s) : s;
      })
      .join("");
  }

  return (escapeText !== false ? Blaze._escape(result) : result) as any;
};

if (Meteor.isClient) {
  // register a helper to use it in the templates
  Template.registerHelper(
    "i18n",
    function (
      key: string,
      defaultValueOrData: string | { hash?: Record<string, unknown> } = {},
      data?: { hash: Record<string, unknown> },
    ) {
      // defaultValue is optional
      if (typeof defaultValueOrData === "string") {
        // function (key, defaultValue, data)

        if (data?.hash?.attr) {
          delete data?.hash?.attr;
          return i18n(key, defaultValueOrData, { ...data?.hash });
        }
        // We can use SafeString because i18n encodes all non-safe strings
        return Spacebars.SafeString(
          i18n(key, defaultValueOrData, { ...data?.hash, escapeText: true }),
        );
      }

      // function (key, data)

      if (defaultValueOrData?.hash?.attr) {
        delete defaultValueOrData?.hash?.attr;
        return i18n(key, { ...defaultValueOrData?.hash });
      }
      // We can use SafeString because i18n encodes all non-safe strings
      return Spacebars.SafeString(i18n(key, { ...defaultValueOrData.hash, escapeText: true }));
    },
  );
}
