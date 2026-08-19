import { Match } from "meteor/check";
import { useTranslation } from "react-i18next";
import IntlMessageFormat, { PrimitiveType } from "intl-messageformat";
import { i18n } from "i18next";
import { $Dictionary } from "i18next/typescript/helpers";
import { ReactElement } from "react";

/** allows localized value eg. with `getLocalizedValue(...)` to have a string per language. */
export const LocalizedValuePattern = Match.OneOf(
  String,
  Match.ObjectIncluding<Record<string, string | undefined>>({}),
);

export type LocalizedValue = Match.PatternMatch<typeof LocalizedValuePattern>;

export function getLocalizedValue(
  i18n: i18n,
  setting: LocalizedValue | undefined | null,
  variables?: Record<string, PrimitiveType> | undefined,
): string;
export function getLocalizedValue(
  i18n: i18n,
  setting: LocalizedValue | undefined | null,
  variables?: Record<string, PrimitiveType | ReactElement> | undefined,
): string | ReactElement | (string | ReactElement)[];
/**
 * Returns a localized value based on the locale. It is also supported to give a 
 * key from the translation files. 
 * @example {
			"en": "https://about.openki.net/en/ueber-uns/spenden/",
			"de": "https://about.openki.net/ueber-uns/spenden/"
		}
 * @example "donate.linkText"
 */
export function getLocalizedValue(
  i18n: i18n,
  setting: LocalizedValue | undefined | null,
  variables?: Record<string, PrimitiveType | ReactElement> | undefined,
) {
  const locale = i18n.resolvedLanguage || "en";

  if (!setting) {
    return undefined;
  }

  function format(value: string | undefined) {
    if (typeof value !== "string") {
      return undefined;
    }
    return new IntlMessageFormat(value, locale).format(variables);
  }

  if (typeof setting === "string") {
    // check if translated key exist otherwise use setting
    if (i18n.exists(setting)) {
      return i18n.t(setting, { ...variables } as $Dictionary);
    }
    return format(setting);
  }

  if (setting[locale]) {
    // exact match found
    return format(setting[locale]);
  }
  const parts = locale.split("-");
  if (parts.length > 1) {
    const translation = setting[parts[0]];
    if (translation) {
      // found eg. "de" for "de-CH"
      return format(translation);
    }
  }
  // fallback take first
  const translation = setting[Object.keys(setting)[0]];
  return format(translation);
}

interface GetLocalizedValue {
  (
    setting: LocalizedValue | undefined | null,
    variables?: Record<string, PrimitiveType> | undefined,
  ): string;

  (
    setting: LocalizedValue | undefined | null,
    variables?: Record<string, PrimitiveType | ReactElement> | undefined,
  ): string | ReactElement | (string | string | ReactElement)[];
}

export function useLocalizedSetting() {
  const { i18n } = useTranslation();

  return {
    getLocalizedValue: ((
      setting: LocalizedValue | undefined | null,
      variables?: Record<string, PrimitiveType | ReactElement> | undefined,
    ) => getLocalizedValue(i18n, setting, variables)) as GetLocalizedValue,
  };
}
