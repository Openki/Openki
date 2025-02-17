import React, {  useState } from "react";
import { Router } from "meteor/iron:router";
import { _ } from "meteor/underscore";
import moment from "moment";

import { LogCollection, LogEntity } from "/imports/api/log/factory";
import { Log } from "/imports/api/log/log";
import * as Logs from "/imports/api/log/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as UrlTools from "/imports/utils/url-tools";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./log-entry";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "logPage",

  {
    logs: ReactiveVar<Mongo.Cursor<LogEntity, LogEntity> | undefined>;
    limit: ReactiveVar<number>;
    filter: ReturnType<LogCollection["Filtering"]>;
    updateUrl: () => boolean;
  }
>;

const template = Template.logPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("log.list.windowtitle", "Log"));
  });

  const batchLoad = 100;
  instance.updateUrl = () => {
    const filterParams = instance.filter.toParams();
    const queryString = UrlTools.paramsToQueryString(filterParams);

    const options: { query?: string } = {};

    if (queryString.length) {
      options.query = queryString;
    }

    routerAutoscroll.cancelNext();

    const router = Router.current();
    Router.go(router.route.getName(), {}, options);

    return true;
  };

  instance.logs = new ReactiveVar(undefined);
  instance.limit = new ReactiveVar(batchLoad);

  const filter = Log.Filtering();
  instance.filter = filter;

  // Read URL state
  instance.autorun(() => {
    const query = Template.currentData();
    filter.clear().read(query).done();
  });

  // Update whenever filter changes
  instance.autorun(() => {
    const filterQuery = filter.toQuery();

    // Have some extra log entries ready so that they are shown immediately
    // when more are demanded
    const overLimit = instance.limit.get() + batchLoad + 1;

    Logs.findFilter
      .subscribe(instance, filterQuery, overLimit)()
      .then((r) => {
        instance.logs.set(r);
      });
  });
});

template.helpers({
  privileged() {
    return Meteor.user()?.privileged("admin");
  },

  date() {
    const start = Template.instance().filter.get("start");
    return start?.toISOString() || "";
  },

  relFilter() {
    const { rel } = Template.instance().filter.toParams();
    return rel || "";
  },

  trFilter() {
    const { tr } = Template.instance().filter.toParams();
    return tr || "";
  },

  hasMore() {
    const instance = Template.instance();

    const limit = instance.limit.get();
    const results = instance.logs.get()?.count() || 0;

    return results > limit;
  },

  results() {
    const instance = Template.instance();
    const entries = instance.logs.get()?.fetch().slice(0, instance.limit.get()) || [];
    let last: moment.Moment | false = false;
    const inter: (LogEntity | { interval: string })[] = [];
    entries.forEach((entry) => {
      const ts = moment(entry.ts);
      if (last) {
        const interval = moment.duration(last.diff(ts));
        if (interval.asMinutes() > 1) {
          inter.push({ interval: interval.humanize() });
        }
      }
      inter.push(entry);
      last = ts;
    });
    return inter;
  },
});

template.events({
  // Update the URI when the search-field was changed an loses focus
  "change .js-update-url"(_event, instance) {
    instance.updateUrl();
  },

  "keyup .js-tr-input": _.debounce((_event, instance) => {
    const { filter } = instance;
    filter.disable("tr");

    const trStr = ($(".js-tr-input").val() as string).trim();
    if (trStr) {
      filter.add("tr", trStr);
    }

    filter.done();
  }, 200),

  "keyup .js-date-input": _.debounce((_event, instance) => {
    const { filter } = instance;
    const dateStr = ($(".js-date-input").val() as string).trim();
    if (dateStr === "") {
      filter.disable("start").done();
    } else {
      filter.add("start", dateStr).done();
    }
  }, 200),

  "keyup .js-rel-input": _.debounce((_event, instance) => {
    const { filter } = instance;
    filter.disable("rel");

    const relStr = ($(".js-rel-input").val() as string).trim();
    if (relStr) {
      filter.add("rel", relStr);
    }

    filter.done();
  }, 200),

  "click .js-tr"(event, instance) {
    instance.filter.add("tr", `${this}`);
    if (!(event as any).shiftKey) {
      instance.filter.done();
      instance.updateUrl();
      window.scrollTo(0, 0);
    }
  },

  "click .js-date"(event, instance) {
    const start = moment(this).toISOString();
    instance.filter.add("start", start);
    if (!(event as any).shiftKey) {
      instance.filter.done();
      instance.updateUrl();
      window.scrollTo(0, 0);
    }
  },

  "click .js-rel-id"(event, instance) {
    instance.filter.add("rel", `${this}`);
    if (!(event as any).shiftKey) {
      instance.filter.done();
      instance.updateUrl();
      window.scrollTo(0, 0);
    }
  },

  "click .js-more"(_event, instance) {
    const { limit } = instance;
    limit.set(limit.get() + 100);
  },
});

export function LogPage({query}:{
  // LogCollection.Filtering Params are allowed as data input
  query:  Parameters<ReturnType<LogCollection["Filtering"]>["read"]>[0],

}){




  return {{#unless privileged}}
  <h1>PLZ login as admin!</h1>
{{else}}
  <div className="page-component">
    <div className="js-search-field">
      <div className="input-group">
        <span className="input-group-text">ID</span>
        <input className="js-rel-input js-update-url form-control" type="text" value="{{relFilter}}"
               placeholder="Pw8HSnHtjErhPfCaa, f59a1e7855" />
      </div>
      <div className="input-group">
        <span className="input-group-text">Track</span>
        <input className="js-tr-input js-update-url form-control" type="text" value="{{trFilter}}"
               placeholder="Profile.Region" />
      </div>
      <div className="input-group">
        <span className="input-group-text">Date</span>
        <input className="js-date-input js-update-url form-control" type="text" value="{{date}}"
               placeholder="YYYY-MM-DD hh:mm:ss" />
      </div>
    </div>
  </div>
  <div className="page-component log-pane">
    {{#unless Template.subscriptionsReady}}
      <div className="loading">
        <h1>
          <marquee>&nbsp;&nbsp;&nbsp;LOADING! BE PATIENT! ENJOY THE SUN!</marquee>
        </h1>
      </div>
    {{/unless}}
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Track</th>
        <th>Timestamp</th>
        <th>Rel</th>
        <th>Body</th>
      </tr>
      {{#each results}}
        {{> logEntry}}
      {{else}}
        {{#if Template.subscriptionsReady}}
          <tr>
            <td>Nothing found.</td>
          </tr>
        {{/if}}
      {{/each}}
    </table>

    {{#if hasMore}}
      <div className="text-center">
        <button type="button" className="btn btn-success js-more">
          Show more
        </button>
      </div>
    {{/if}}
  </div>
{{/unless}}
}
