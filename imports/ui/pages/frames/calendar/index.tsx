import React, { useState } from "react";
import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";
import moment from "moment";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";

import { EventModel, Events } from "/imports/api/events/events";

import * as Metatags from "/imports/utils/metatags";

import "./event";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "frameCalendarPage",
  unknown,
  {
    groupedEvents: ReactiveVar<_.Dictionary<EventModel[]>>;
    days: ReactiveVar<string[]>;
    limit: ReactiveVar<number>;
  }
>;

const template = Template.frameCalendarPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("calendar.windowtitle", "Calendar"));
  });

  instance.groupedEvents = new ReactiveVar({});
  instance.days = new ReactiveVar([]);

  const { query } = Router.current().params;
  instance.limit = new ReactiveVar(parseInt(query.count || "", 10) || 200);

  let startDate = moment();
  if (query.start) {
    startDate = moment(query.start);
  }
  let endDate: moment.Moment;
  if (query.end) {
    endDate = moment(query.end).add(1, "day");
  }

  instance.autorun(() => {
    const filter = Events.Filtering().read(query);
    if (startDate && startDate.isValid()) {
      filter.add("after", startDate.toISOString());
    }
    if (endDate && endDate.isValid()) {
      filter.add("end", endDate.toISOString());
    }

    const filterQuery = filter.toQuery();
    const limit = instance.limit.get();

    // Show internal events only when a group or venue is specified
    if (!filterQuery.group && !filterQuery.venue && filterQuery.internal === undefined) {
      filterQuery.internal = false;
    }

    instance.subscribe("Events.findFilter", filterQuery, limit + 1);
  });

  instance.autorun(() => {
    const limit = instance.limit.get();
    const events = Events.find({}, { sort: { start: 1 }, limit }).fetch();
    const groupedEvents = _.groupBy(events, (event) =>
      moment(event.start)
        .locale(Session.get("timeLocale") || "en")
        .format("LL"),
    );

    instance.groupedEvents.set(groupedEvents);
    instance.days.set(Object.keys(groupedEvents));
  });
});

template.helpers({
  days() {
    return Template.instance().days.get();
  },

  eventsOn(day: string) {
    return Template.instance().groupedEvents.get()[day];
  },

  moreEvents() {
    const limit = Template.instance().limit.get();
    const eventsCount = Events.find({}, { limit: limit + 1 }).count();

    return eventsCount > limit;
  },
});

template.events({
  "click .js-show-more-events"(_event, instance) {
    const { limit } = instance;
    limit.set(limit.get() + 10);
  },
});


export function Calendar(){

  return <style>
  /* beautify ignore:start */
  {{#each cssRule in cssRules}}
    {{cssRule}}
  {{/each}}
  /* beautify ignore:end */

</style>
{{#each day in days}}
  <h4 class="frame-list-title">{{day}}</h4>
  {{#each event in (eventsOn day)}}
    {{> frameCalendarEvent data=event}}
  {{/each}}
{{/each}}
{{#if Template.subscriptionsReady}}
  {{#unless days}}
    <h2 class="mt-5 text-center">{{i18n 'frame.calendar.noEvents' 'No events planned'}}</h2>
  {{/unless}}
  {{#if moreEvents}}
    <div class="mt-2 text-center">
      <button class="btn btn-secondary js-show-more-events" type="button">
        {{i18n '_button.more'}}
      </button>
    </div>
  {{/if}}
{{else}}
  {{> loadingRow}}
{{/if}}
}