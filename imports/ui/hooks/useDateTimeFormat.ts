import moment from "moment";
import { useSession } from "./react-meteor-data";

export function useDateTimeFormat() {
  const locale = useSession("timeLocale") || "en";

  /**
   * Converts the input to a moment that the locale is set to timeLocale.
   *
   * Note: This is necessary because the global call moment.locale() only applies to new objects. For
   * existing moments we have to set it manually.
   * Calling useSession('timeLocale') also makes the helper reactive.
   */
  function toMomentWithTimeLocale(date?: moment.MomentInput) {
    return moment(date).locale(locale);
  }

  return {
    dateShort(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("l");
    },
    dateFormat(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("L");
    },
    dateLong(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("ll");
    },
    dateTimeLong(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("llll");
    },
    timeShort(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("H");
    },
    timeFormat(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("LT");
    },
    fromNow(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).fromNow();
    },
    dayOfWeekShort(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("dd");
    },
    dayOfWeek(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("ddd");
    },
    dayOfWeekLong(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("dddd");
    },
    dayOfWeekAndMonthShort(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }

      // from moment.js
      switch (moment.locale()) {
        case "de" /* copy of de-ch */:
          return toMomentWithTimeLocale(date).format("ddd, D. MMM");

        default:
          return toMomentWithTimeLocale(date).format("ddd, MMM D");
      }
    },
    dayOfWeekAndMonthLong(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }

      // from moment.js
      switch (moment.locale()) {
        case "de" /* copy of de-ch */:
          return toMomentWithTimeLocale(date).format("dddd, D. MMMM");

        default:
          return toMomentWithTimeLocale(date).format("dddd, MMMM D");
      }
    },
    weekNr(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).week();
    },
    calendarDayShort(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }

      const momentForYear = toMomentWithTimeLocale(date);
      const year =
        momentForYear.year() !== moment().year() ? ` ${momentForYear.format("YYYY")}` : "";
      return toMomentWithTimeLocale(date).format("D. MMMM") + year;
    },
    calendarDayFormat(date?: moment.MomentInput) {
      if (!date) {
        return "";
      }
      return toMomentWithTimeLocale(date).format("dddd, Do MMMM");
    },
    dateToRelativeString(date: moment.MomentInput) {
      if (!date) {
        return "";
      }
      const relative = toMomentWithTimeLocale().to(date);
      return relative.charAt(0).toUpperCase() + relative.slice(1);
    },
  };
}
