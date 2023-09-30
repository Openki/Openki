import { ServerPublishOne } from "/imports/utils/ServerPublish";
import { check } from "meteor/check";

import { InfoPages } from "/imports/api/infoPages/infoPages";

export const [details, useDetails] = ServerPublishOne(
  "infoPage",
  (slug: string, locale: string) => {
    check(slug, String);
    check(locale, String);

    const locales = [locale];
    const parts = locale.split("-");
    if (parts.length > 1) {
      locales.push(parts[0]);
    }
    locales.push("en");
    return InfoPages.find({ slug, locale: { $in: locales } }, { sort: { accuracy: -1 }, limit: 1 });
  },
  (slug: string, locale: string) => {
    const locales = [locale];
    const parts = locale.split("-");
    if (parts.length > 1) {
      locales.push(parts[0]);
    }
    locales.push("en");
    return InfoPages.findOne({ slug, locale: { $in: locales } }, { sort: { accuracy: -1 } });
  }
);
