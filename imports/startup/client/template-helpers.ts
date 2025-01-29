import { i18n } from "/imports/startup/both/i18next";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Spacebars } from "meteor/spacebars";
import { Blaze } from "meteor/blaze";
import moment from "moment";
import { ReactiveDict } from "meteor/reactive-dict";

import { Regions } from "/imports/api/regions/regions";

import { getSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getLocalizedValue, LocalizedValue } from "/imports/utils/getLocalizedValue";
import { buildCssVariableColor } from "/imports/utils/getColor";
import { checkContribution } from "/imports/utils/checkContribution";
import { locationFormat } from "/imports/utils/location-format";
import { getCachedUser, getUserName } from "/imports/ui/lib/getUserName";
import { Roles } from "/imports/api/roles/roles";

/**
 * Converts the input to a moment that the locale is set to timeLocale.
 *
 * Note: This is necessary because the global call moment.locale() only applies to new objects. For
 * existing moments we have to set it manually.
 * Calling Session.get('timeLocale') also makes the helper reactive.
 */
function toMomentWithTimeLocale(date: moment.MomentInput) {
  return moment(date).locale(Session.get("timeLocale") || "en");
}

// eslint-disable-next-line @typescript-eslint/ban-types
const helpers: { [name: string]: Function } = {
  siteName() {
    return getSiteName(Regions.currentRegion());
  },

  categoryName(name: string) {
    return i18n(`category.${name}`);
  },

  roleShort(type: string) {
    if (!type) {
      return "";
    }
    return i18n(`roles.${type}.short`);
  },

  roleIcon(type: string) {
    if (!type) {
      return "";
    }

    return Roles.find((r) => r.type === type)?.icon || "";
  },

  regions() {
    return Regions.find();
  },

  currentRegionName() {
    return Regions.currentRegion()?.name || "";
  },

  /**
   * @param id Region ID
   */
  isCurrentRegion(id: string) {
    return id && Session.equals("region", id);
  },

  PublicSettings() {
    return PublicSettings;
  },

  localized(value: LocalizedValue | null | undefined) {
    return getLocalizedValue(value);
  },

  buildCssVariableColor(name: string, value: string) {
    return buildCssVariableColor(name, value);
  },

  log(context: unknown) {
    if (window.console) {
      /* eslint-disable-next-line no-console */
      console.log(arguments.length > 0 ? context : this);
    }
  },

  // Date & Time format helper
  dateShort(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("l");
  },

  dateFormat(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("L");
  },

  dateLong(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("ll");
  },

  dateTimeLong(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("llll");
  },

  timeFormat(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("LT");
  },

  fromNow(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).fromNow();
  },

  weekdayFormat(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("ddd");
  },

  weekNr(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).week();
  },

  calendarDayShort(date: moment.MomentInput) {
    if (!date) {
      return false;
    }

    const momentForYear = toMomentWithTimeLocale(date);
    const year = momentForYear.year() !== moment().year() ? ` ${momentForYear.format("YYYY")}` : "";
    return toMomentWithTimeLocale(date).format("D. MMMM") + year;
  },

  calendarDayFormat(date: moment.MomentInput) {
    if (!date) {
      return false;
    }
    return toMomentWithTimeLocale(date).format("dddd, Do MMMM");
  },

  locationFormat(loc: { coordinates: [number, number] }) {
    return locationFormat(loc);
  },

  geoLocationLink(loc: { coordinates: [number, number] }) {
    return `geo:${loc?.coordinates?.[1]},${loc?.coordinates?.[0]}`;
  },

  /**
   * Strip HTML markup
   */
  plain(html: string) {
    // Prevent words from sticking together
    // eg. <p>Kloradf dadeq gsd.</p><p>Loradf dadeq gsd.</p> => Kloradf dadeq gsd. Loradf dadeq gsd.
    const htmlPreparedForMinimalStyling = html
      .replace(/<br \/>/g, "<br /> ")
      .replace(/<p>/g, "<p> ")
      .replace(/<\/p>/g, "</p> ")
      .replace(/<h2>/g, "<h2> ")
      .replace(/<\/h2>/g, "</h2> ")
      .replace(/<h3>/g, "<h3> ")
      .replace(/<\/h3>/g, "</h3> ");
    // Source: https://stackoverflow.com/questions/822452/strip-html-from-text-javascript/47140708#47140708
    const doc = new DOMParser().parseFromString(htmlPreparedForMinimalStyling, "text/html");
    return doc.body.textContent || "";
  },

  /**
   * Compare activity to template business
   * This can be used to show a busy state while the template is working.
   *
   * Example: <button>{#if busy 'saving'}Saving...{else}Save now!{/if}</button>
   *
   * @param activity compare to this activity
   * @returns Whether business matches activity
   */
  busy(activity?: string | boolean) {
    const business = Template.instance().findBusiness();
    return business.get() === activity;
  },

  /**
   * Disable buttons while there is business to do.
   *
   * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
   *
   * @return 'disabled' if the template is currently busy, empty string otherwise.
   */
  disabledIfBusy() {
    const business = Template.instance().findBusiness();
    return business.get() ? "disabled" : "";
  },

  state(key: string) {
    const state = (Template.instance() as any).state as ReactiveDict | undefined;

    if (!(state instanceof ReactiveDict)) {
      throw new Error("state is not a ReactiveDict");
    }

    return state.get(key);
  },

  stateEquals(key: string, value: any) {
    const state = (Template.instance() as any).state as ReactiveDict | undefined;

    if (!(state instanceof ReactiveDict)) {
      throw new Error("state is not a ReactiveDict");
    }

    return state.equals(key, value);
  },

  /**
   * This can be used to directly access instance methods without declaring
   * helpers.
   * @returns The instance for use in the template
   */
  instance() {
    return Template.instance();
  },

  /**
   * Takes any number of arguments and returns them concatenated.
   */
  concat(...strings: string[]) {
    return Array.prototype.slice.call(strings, 0, -1).join("");
  },
};

Object.entries(helpers).forEach(([name, helper]) => Template.registerHelper(name, helper));

/**
 * Register username and contribution helper. Cache the user data.
 */
Template.registerHelper("username", function (userId: string) {
  return getUserName(userId);
});

Template.registerHelper("contribution", function (userId: string) {
  if (!userId) {
    return "";
  }

  const contribution = PublicSettings.contribution;

  if (!contribution) {
    return "";
  }

  const cachedUser = getCachedUser(userId);

  if (!cachedUser) {
    return "";
  }

  if (!checkContribution(cachedUser.contribution)) {
    return "";
  }

  return Spacebars.SafeString(
    `<a href="${getLocalizedValue(
      contribution.link,
    )}" data-bs-toggle="tooltip" data-bs-title="${Blaze._escape(
      i18n(
        "user.hasContributed",
        "{USERNAME} supported {SITENAME} with a donation. Click the {ICON} for how to contribute.",
        {
          USERNAME: cachedUser.getDisplayName(),
          SITENAME: getSiteName(Regions.currentRegion()),
          ICON: Spacebars.SafeString(`<i class="${contribution.icon}" aria-hidden="true"></i>`),
        },
      ),
    )}"><sup><i class="${contribution.icon}" aria-hidden="true"></i></sup></a>`,
  );
});

/** Utility to simplify the map of a Blaze component to a React component for backwards compatibility. */
Template.registerHelper("component", function (this: any, f: any) {
  const self = { ...this };
  self.component = f;
  return self;
});
