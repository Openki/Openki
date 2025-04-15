import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Meteor } from "meteor/meteor";
import { MeteorAsync, TrackerAsync } from "/imports/utils/promisify";

import moment from "moment";

import { EventEntity, EventModel, Events } from "/imports/api/events/events";

import * as UrlTools from "/imports/utils/url-tools";
import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/events/list";
import "/imports/ui/components/calendar-nav/week";
import type { Props as CalendarNavData } from "/imports/ui/components/calendar-nav/week";

import "./template.html";
import "./styles.scss";

const DefaultLimit = 200;

interface Weekday {
  date: moment.Moment;
  dayEvents: Mongo.Cursor<EventEntity, EventModel>;
}

const Template = TemplateAny as TemplateStaticTyped<
  "frameWeekPage",
  Record<string, string>,
  {
    startOfWeek: moment.Moment;
    weekdays: Weekday[];
    filter: ReturnType<(typeof Events)["Filtering"]>;
    limit: number;
    update: () => void;
    state: ReactiveDict<{
      isAttendeeFilterOn: boolean;
    }>;
  }
>;

const template = Template.frameWeekPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("calendar.windowtitle", "Calendar"));
  });

  instance.weekdays = [];

  instance.state = new ReactiveDict();
  instance.state.setDefault({ isAttendeeFilterOn: false });

  instance.autorun(() => {
    const data = Template.currentData();

    instance.filter = Events.Filtering().read(data);

    const date = instance.filter.get("after") || moment(reactiveNow.get());

    instance.startOfWeek = date.startOf("week");

    const filterQuery = instance.filter.toQuery();

    const userId = Meteor.userId();
    // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
    if (userId && instance.state.get("isAttendeeFilterOn")) {
      filterQuery.participant = userId;
    }

    const startOfWeek = instance.startOfWeek;
    if (startOfWeek) {
      filterQuery.after = startOfWeek.toDate();
      filterQuery.end = moment(startOfWeek).add(1, "week").toDate();
    }

    instance.limit =
      new Filtering({
        count: Predicates.integer,
      })
        .read(data)
        .toQuery().count || DefaultLimit;

    instance.subscribe("Events.findFilter", filterQuery, instance.limit + 1);
  });

  instance.autorun(() => {
    const data = Template.currentData();
    const filter = Events.Filtering().read(data);

    const start = instance.startOfWeek;
    const end = moment(start).add(1, "week");

    const weekdays = [];
    let current = moment(start);
    while (current.isBefore(end)) {
      const next = moment(current).add(1, "day");
      const filterQuery = filter.toQuery();
      filterQuery.after = current.toDate();
      filterQuery.end = next.toDate();

      weekdays.push({
        date: current,
        dayEvents: Events.findFilter(filterQuery, instance.limit),
      });
      current = next;
    }
    instance.weekdays = weekdays;
  });

  instance.update = () => {
    const filterParams = instance.filter.toParams() as Record<string, string>;
    filterParams.count = instance.limit.toString();
    if (instance.data.control) {
      filterParams.control = instance.data.control;
    } else {
      delete filterParams.control;
    }
    if (instance.data.hideSwitches) {
      filterParams.hideSwitches = instance.data.hideSwitches;
    } else {
      delete filterParams.hideSwitches;
    }
    if (instance.data.filterGroups) {
      filterParams.filterGroups = instance.data.filterGroups;
    } else {
      delete filterParams.filterGroups;
    }
    delete filterParams.region; // HACK region is kept in the session (for bad reasons)
    const queryString = UrlTools.paramsToQueryString(filterParams);

    const options: { query?: string } = {};
    if (queryString.length) {
      options.query = queryString;
    }

    Router.go(Router.current().route.getName(), {}, options);
  };
});

template.onRendered(function () {
  const instance = Template.instance();

  // change of week does not trigger onRendered again
  instance.autorun(async () => {
    const { data } = instance;

    instance.filter = Events.Filtering().read(data);

    const date = instance.filter.get("after") || moment(reactiveNow.get());

    // only do this in the current week
    if (moment().format("w") === date?.format("w")) {
      if (instance.subscriptionsReady()) {
        await TrackerAsync.afterFlush();
        await MeteorAsync.defer();
        const elem = instance.$(".js-calendar-date").eq(moment().weekday());

        // calendar nav and topnav are together 137px fixed height, we add 3px margin
        document.querySelector(".frame")?.scrollTo(0, (elem.offset() || { top: 0 }).top - 3);
      }
    }
  });
});

template.helpers({
  control() {
    return Template.instance().data.control === "1";
  },

  calendarNavAttr() {
    const instance = Template.instance();
    return {
      hideSwitches: instance.data.hideSwitches === "1",
      search: instance.filter.get("search"),
      onChangeSearch: (newValue: string) => {
        instance.filter.add("search", newValue);
        instance.update();
      },
      date: instance.startOfWeek,
      onChangeDate: (newDate) => {
        instance.filter.add("after", newDate.startOf("week").toISOString());
        instance.update();
      },
      availableGroups: new Filtering({
        filterGroups: Predicates.ids,
      })
        .read(instance.data)
        .get("filterGroups"),
      selectedGroups: instance.filter.get("groups"),
      onAddGroup: (group) => {
        instance.filter.add("groups", group);
        instance.update();
      },
      onRemoveGroup: (group) => {
        instance.filter.remove("groups", group);
        instance.update();
      },
      categories: instance.filter.get("categories"),
      onAddCategory: (category) => {
        instance.filter.add("categories", category);
        instance.update();
      },
      onRemoveCategory: (category) => {
        instance.filter.remove("categories", category);
        instance.update();
      },
      onChangeAttendingEventsOnly: (state) => {
        instance.state.set("isAttendeeFilterOn", state);
      },
    } as CalendarNavData;
  },

  hasDayEvents(weekday: Weekday) {
    return weekday.dayEvents.count() > 0;
  },

  weekdays() {
    return Template.instance().weekdays;
  },
});
