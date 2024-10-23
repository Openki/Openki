import { Match } from "meteor/check";
import { Session } from "meteor/session";
import { useTranslation } from "react-i18next";
import { useSession } from "./react-meteor-data";
import { SafeString } from "./CustomChecks";

/** allows localised value eg. with `getLocalizedValue(...)` to have a string per language. */
export const LocalizedValuePattern = Match.OneOf(
  SafeString(),
  Match.ObjectIncluding<Record<string, string | undefined>>({}),
);

export type LocalizedValue = Match.PatternMatch<typeof LocalizedValuePattern>;

/**
 * Returns a loacalised value based on the current set locale. 
 * @example {
			"en": "https://about.openki.net/en/ueber-uns/spenden/",
			"de": "https://about.openki.net/ueber-uns/spenden/"
		}
 */
export function getLocalizedValue(
  setting: LocalizedValue | undefined | null,
  locale: string = Session.get("locale"),
) {
  if (!setting) {
    return undefined;
  }

  if (typeof setting === "string") {
    return setting;
  }

  if (setting[locale]) {
    // excact match found
    return setting[locale];
  }

  const parts = locale.split("-");
  if (parts.length > 1) {
    if (setting[parts[0]]) {
      // found eg. "de" for "de-CH"
      return setting[locale];
    }
  }

  // fallback take first
  return setting[Object.keys(setting)[0]];
}

export function useLocalizedSetting() {
  const sessionLocale = useSession("locale");
  const { t } = useTranslation();
  return {
    getLocalizedValue: (
      setting: LocalizedValue | undefined | null,
      locale: string = sessionLocale,
    ) => {
      if (!setting) {
        return undefined;
      }
      if (typeof setting === "string") {
        // check if translated key exist otherwise use setting
        return t(setting) || setting;
      }
      if (setting[locale]) {
        // excact match found
        return setting[locale];
      }
      const parts = locale.split("-");
      if (parts.length > 1) {
        if (setting[parts[0]]) {
          // found eg. "de" for "de-CH"
          return setting[locale];
        }
      }
      // fallback take first
      return setting[Object.keys(setting)[0]];
    },
  };
}
