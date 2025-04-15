import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";

import { LanguagesRaw, Languages, LanguageEntity } from "/imports/api/languages/languages";

import { Type } from "/imports/utils/CustomChecks";
import { ServerPublishMany } from "/imports/utils/ServerPublish";

const weblateMapping = { de_ZH: "de-ZH", nb_NO: "nb" } as Record<string, string>;

const languages = { ...LanguagesRaw };

if (Meteor.isServer) {
  /** Enrich Languages with stats from weblate */
  (async function enrichLanguages() {
    const fetch = (await import("node-fetch")).default;
    try {
      // See: https://docs.weblate.org/en/latest/api.html#exports
      const response = await fetch(
        "https://hosted.weblate.org/exports/stats/openki/openki/?format=json",
      );
      const stats = (await response.json()) as {
        code: string;
        translated_percent: number;
      }[];

      Object.entries(languages).forEach(([code, value]) => {
        const translatedPercent = stats.filter(
          (s) => (weblateMapping[s.code] || s.code) === code,
        )[0]?.translated_percent;

        if (translatedPercent) {
          // eslint-disable-next-line no-param-reassign
          value.translatedPercent = Math.round(translatedPercent);
        }
      });
    } catch {
      // ignore it
    }
  })();
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
  (filter: FindFilter) => {
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
