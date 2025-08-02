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

// eslint-disable-next-line no-constant-condition
if (false) {
  // whitelist, this is needed for meteor's dynamic-import module, to allow dynamic loading of modules
  // on the client: https://docs.meteor.com/packages/dynamic-import.html#Using-import-with-dynamic-expressions
  import("/imports/startup/both/i18n/en.json");

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

// and only load translations we need
backends.push(
  resourcesToBackend((language, _namespace, callback) => {
    const fileName = PublicSettings.i18nMapping?.[language] || language;
    import(`/imports/startup/both/i18n/${fileName}.json`)
      .then((resources) => {
        callback(null, resources);
      })
      .catch((error) => {
        callback(error, null);
      });
  }),
);

i18next
  .use(ICU)
  .use(ChainedBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    backend: {
      backends,
      backendOptions: [
        {
          expirationTime: 60 * 60 * 1000, // 1h   (7 * 24 * 60 * 60 * 1000 = 7 days)
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
 * It is used to update string in the ui after without reloading the page
 */
const reactiveLang = new ReactiveVar(Math.random());
i18next.on("languageChanged", function () {
  reactiveLang.set(Math.random());
});
i18next.on("loaded", function () {
  reactiveLang.set(Math.random());
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
