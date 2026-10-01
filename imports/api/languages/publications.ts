import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { serializeError } from "serialize-error";

import { LanguagesRaw, Languages, LanguageEntity } from "/imports/api/languages/languages";

import { Type } from "/imports/utils/CustomChecks";
import { ServerPublishMany } from "/imports/utils/ServerPublish";

const weblateMapping = { de_ZH: "de-ZH", nb_NO: "nb" } as Record<string, string>;

const languages = { ...LanguagesRaw };

// IDEA: During development, cache the development
// if .temp has a weblate-stats.json and it is from the last day, keep it

/**
 * Load Weblate translation stats for the Openki project.
 *
 * During development, the result will be cached for one day to reduce unnecessary requests.
 */
async function loadWeblateStats() {
  // TODO: If development, try to load from cached file if it exists
  // TODO: If file exists and was updated < 1 day ago, then return stats
  // TODO: else continue and fall back to network

  try {
    // See: https://docs.weblate.org/en/latest/api.html#exports
    const response = await fetch(
      "https://hosted.weblate.org/api/components/openki/openki/statistics/?format=json",
    );

    if (!response.ok) {
      // During development, we often get rate-limited due to too frequent requests.
      // Related issue: https://gitlab.com/Openki/Openki/-/work_items/2465
      console.log("Failed to load Weblate statistics: ", await response.text());
      return null;
    }

    const stats = (await response.json()) as {
      results: {
        code: string;
        translated_percent: number;
      }[];
    };

    return stats;
  } catch (ex) {
    // ignore it
    console.info(`Failed to load Weblate statistics: ${serializeError(ex)}`);
  }

  return null;
}

/**
 * Attempts to add Weblate translation stats to the languages.
 */
async function enrichLanguagesWithWeblateStats() {
  const stats = await loadWeblateStats();

  // Sometimes both the cache and network fails, so we can only
  // enrich languages if we get back actual stats.
  if (stats) {
    Object.entries(languages).forEach(([code, value]) => {
      const translatedPercent = stats.results.filter(
        (s) => (weblateMapping[s.code] || s.code) === code,
      )[0]?.translated_percent;

      if (translatedPercent) {
        value.translatedPercent = Math.round(translatedPercent);
      }
    });
  }
}

if (Meteor.isServer) {
  enrichLanguagesWithWeblateStats();
}

export const FindFilterPattern = {
  code: Match.Maybe(String),
  visible: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

// See: https://guide.meteor.com/data-loading.html#custom-publication
export const [findFilter, useFindFilter] = ServerPublishMany(
  "Languages",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function (_filter: FindFilter) {
    Object.entries(languages).forEach(([code, value]) => {
      this.added("Languages", code, value);
    });
    return undefined;
  },
  (filter) => {
    check(filter, Match.Maybe(FindFilterPattern));

    const selector: Mongo.Selector<LanguageEntity> = filter.code
      ? {
          _id: filter.code,
        }
      : {};

    if (typeof filter.visible === "boolean") {
      selector.visible = filter.visible;
    }

    return Languages.find(selector);
  },
);
