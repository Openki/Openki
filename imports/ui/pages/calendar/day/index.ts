import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import { EventModel, Events, FindFilter } from "/imports/api/events/events";
import "/imports/ui/components/calendar-nav/multi";
import "/imports/ui/components/events/list";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "calendarDay",
  {
    day: {
      start: moment.Moment;
      end: moment.Moment;
    };
    filter: ReturnType<(typeof Events)["Filtering"]>;
    isAttendeeFilterOn: boolean;
  }
>;

const template = Template.calendarDay;

template.helpers({
  hasEvents() {
    const data = Template.instance().data;
    const filterQuery: FindFilter = data.filter.toQuery();
    filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

    return Events.findFilter(filterQuery, 1).count() > 0;
  },
  events() {
    const data = Template.instance().data;
    const filterQuery: FindFilter = data.filter.toQuery();
    filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

    return Events.findFilter(filterQuery);
  },
  maybeFilteredEvents(events: EventModel[], filters: { hash: { isAttendeeFilterOn: boolean } }) {
    let maybeFilteredEvents = [...events];
    const userId = Meteor.userId();
    if (filters.hash.isAttendeeFilterOn && userId) {
      maybeFilteredEvents = maybeFilteredEvents.filter((event) => event.attendedBy(userId));
    }
    return maybeFilteredEvents;
  },
});
