import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";
import { ReactiveDict } from "meteor/reactive-dict";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";

import { Events } from "/imports/api/events/events";
import { Regions } from "/imports/api/regions/regions";

import { MeteorAsync, TrackerAsync } from "/imports/utils/promisify";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/calendar-nav/multi";
import "/imports/ui/components/events/list";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "calendarPage",
  Record<string, string>,
  {
    filter: ReturnType<(typeof Events)["Filtering"]>;
    state: ReactiveDict<{
      isAttendeeFilterOn: boolean;
    }>;
    setIsAttendeeFilterOn: (state: boolean) => void;
  }
>;

const template = Template.calendarPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("calendar.windowtitle", "Calendar"));
  });

  const filter = Events.Filtering();
  instance.filter = filter;

  instance.state = new ReactiveDict();
  instance.state.setDefault({ isAttendeeFilterOn: false });
  instance.setIsAttendeeFilterOn = (state: boolean) => {
    this.state.set("isAttendeeFilterOn", state);
  };

  // Read URL state
  instance.autorun(() => {
    const data = Template.currentData();

    // Show internal events only when a group or venue is specified
    if (!data.group && !data.venue && data.internal === undefined) {
      data.internal = "0";
    }

    const start = Regions.currentRegion()?.calendarStartDate || new Date();
    filter
      .clear()
      .add("start", moment(start).startOf("week").toISOString())
      .read(data)
      .add("region", Session.get("region"))
      .done();

    const filterQuery = filter.toQuery();

    const startMoment = filter.get("start") as moment.Moment;
    const after = startMoment.toDate();
    const end = startMoment.add(1, "week").toDate();

    filterQuery.after = after;
    filterQuery.end = end;
    instance.subscribe("Events.findFilter", filterQuery);
  });
});

template.onRendered(function () {
  const instance = Template.instance();
  // change of week does not trigger onRendered again
  instance.autorun(async () => {
    // only do this in the current week
    if (moment().format("w") === instance.filter.get("start")?.format("w")) {
      if (instance.subscriptionsReady()) {
        await TrackerAsync.afterFlush();
        await MeteorAsync.defer();
        const elem = instance.$(".js-calendar-date").eq(moment().weekday());

        // calendar nav and topnav are together 137px fixed height, we add 3px margin
        window.scrollTo(0, (elem.offset() || { top: 0 }).top - 140);
      }
    }
  });
});

template.helpers({
  days() {
    const start = Template.instance().filter.get("start");
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      days.push({
        start: moment(start).add(i, "days"),
        end: moment(start).add(i + 1, "days"),
      });
    }
    return days;
  },
  startDate() {
    return moment(Template.instance().filter.get("start"));
  },
  setterToBePassedToChild() {
    // returns a function
    return Template.instance().setIsAttendeeFilterOn;
  },
  isAttendeeFilterOn() {
    // returns a value of the state (true / false)
    return Template.instance().state.get("isAttendeeFilterOn");
  },
  filter() {
    return Template.instance().filter;
  },
});
