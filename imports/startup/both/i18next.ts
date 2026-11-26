import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import i18next, { BackendModule } from "i18next";
import ICU from "i18next-icu";
import ChainedBackend from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import LocalStorageBackend, { LocalStorageBackendOptions } from "i18next-localstorage-backend";
import { LanguagesRaw } from "/imports/api/languages/languages";
// @ts-expect-error types for Handlebars are not visible, but the runtime code works. This can be removed after replacing Blaze and iron:router.
import { Blaze as OriginalBlaze, Handlebars as OriginalHandlebars } from "meteor/blaze";
import { Spacebars } from "meteor/spacebars";
import { initReactI18next, setDefaults } from "react-i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";

// Wrap to override types
const { Blaze, Handlebars } = {
  Handlebars: OriginalHandlebars as any,
  Blaze: OriginalBlaze as unknown as {
    _escape(str: string): string;
  },
};

/**
 * i18n namespace loaders.
 *
 * By importing the glob pattern dynamically, we tell Rspack to watch these
 * files for changes and reload the i18next module and its importers when something changes.
 */
const namespaceLoaders = Object.fromEntries(
  Object.entries(
    import.meta.glob<Record<string, unknown>>("/imports/startup/both/**/*.json", {
      import: "default",
    }),
  ).map(([path, loader]) => [
    path.replace("/imports/startup/both/i18n/", "").replace(".json", ""),
    loader,
  ]),
);

let localStorageSupported;
try {
  localStorage.setItem("test1234", "test1234");
  localStorage.removeItem("test1234");
  localStorageSupported = true;
} catch {
  // not allowed
  localStorageSupported = false;
}

// Initialize backends and their configurations at the same time to make sure they are used in the correct order.
const backendConfig = {
  backends: [] as (BackendModule | typeof LocalStorageBackend)[],
  backendOptions: [] as unknown[],
};

if (localStorageSupported) {
  // We use localStorage to cache translations for 1h in production.
  backendConfig.backends.push(LocalStorageBackend);
  backendConfig.backendOptions.push({
    // Disable translation caching during development
    expirationTime: Meteor.isDevelopment ? 0 : 60 * 60 * 1000, // 1 hour
  } satisfies LocalStorageBackendOptions);
}

// and only load translations for the languages and namespaces we need
backendConfig.backends.push(
  resourcesToBackend(async (language: string, namespace: string) => {
    if (namespace === "common") {
      // NOTE: We simulate a "common" namespace to make it consistent with newer, namespaced
      // translations, like for example roles.
      const customLanguageCode = PublicSettings.i18nMapping?.[language];
      if (customLanguageCode) {
        // when there is a mapping we use the original language as fallback
        const customLanguageFile = await namespaceLoaders[customLanguageCode]();
        const fallbackLanguageFile = await namespaceLoaders[language]();
        return {
          default: {
            ...fallbackLanguageFile,
            ...customLanguageFile,
          },
        };
      } else {
        return namespaceLoaders[language]();
      }
    }
    return namespaceLoaders[`${namespace}/${language}`]();
  }),
);
backendConfig.backendOptions.push(undefined);

// Set default config for all react-i18next instances using the recommended approach since version 18.
// This needs to be configured before `initReactI18next` is called by the main i18next instance.
setDefaults({ useSuspense: false });

i18next
  .use(ICU)
  .use(ChainedBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    ns: ["common", "roles"],
    defaultNS: "common",
    backend: backendConfig,
  });

if (Meteor.isServer) {
  // On the server we preload all languages.
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
