import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { serializeError } from "serialize-error";

import { LanguagesRaw, Languages, LanguageEntity } from "/imports/api/languages/languages";

import { Type } from "/imports/utils/CustomChecks";
import { ServerPublishMany } from "/imports/utils/ServerPublish";

const weblateMapping = { de_ZH: "de-ZH", nb_NO: "nb" } as Record<string, string>;

const languages = { ...LanguagesRaw };

interface WeblateStatsResponse {
  results: {
    code: string;
    translated_percent: number;
  }[];
}

interface WeblateCacheFile {
  updatedAt: number;
  response: WeblateStatsResponse;
}

/**
 * Load Weblate translation stats for the Openki project.
 *
 * During development, the result will be cached to
 * reduce unnecessary Weblate API requests for every dev server restart.
 */
async function loadWeblateStats() {
  // Dynamically import Node modules since this code should only run on the server.
  const { readFile, writeFile, realpath } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { resolve } = await import("node:path");

  /**
   * The Weblate stats file will be cached for up `maxCacheDuration`,
   * but may be removed earlier depending on when the OS clears temporary files.
   */
  const weblateCacheFile = resolve(await realpath(tmpdir()), "openki-weblate-stats.json");
  const maxCacheDuration = 1000 * 60 * 60 * 24 * 7; // One week

  if (Meteor.isDevelopment) {
    try {
      const cachedStats: WeblateCacheFile | null = JSON.parse(
        await readFile(weblateCacheFile, "utf-8"),
      );

      // Return cached response if it exists and is reasonably up to date.
      if (
        cachedStats &&
        Number.isInteger(cachedStats.updatedAt) &&
        cachedStats.updatedAt > Date.now() - maxCacheDuration
      ) {
        return cachedStats.response;
      }
      // oxlint-disable-next-line no-unused-vars
    } catch {
      // Unable to use the cached Weblate stats file, for whatever reason.
    }
  }

  // Fall back to fetching Weblate stats from the API if we can't use the cached response
  try {
    // See: https://docs.weblate.org/en/latest/api.html#exports
    const response = await fetch(
      "https://hosted.weblate.org/api/components/openki/openki/statistics/?format=json",
    );

    if (!response.ok) {
      // During development, we often get rate-limited due to too frequent requests.
      // Related issue: https://gitlab.com/Openki/Openki/-/work_items/2465
      console.error("Failed to fetch Weblate stats:", await response.text());
      return undefined;
    }

    const stats: WeblateStatsResponse = await response.json();

    if (Meteor.isDevelopment) {
      await writeFile(
        weblateCacheFile,
        JSON.stringify({ updatedAt: Date.now(), response: stats } satisfies WeblateCacheFile),
        "utf-8",
      );
    }

    return stats;
  } catch (error) {
    console.info(`Failed to fetch Weblate stats: ${serializeError(error)}`);
  }

  return undefined;
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
      const translatedPercent = stats.results.find(
        (s) => (weblateMapping[s.code] || s.code) === code,
      )?.translated_percent;

      if (translatedPercent) {
        value.translatedPercent = Math.round(translatedPercent);
      }
    });
  } else {
    console.info("Failed use Weblate stats to enrich languages");
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
