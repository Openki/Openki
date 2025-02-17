import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { debounce } from "lodash";

import { LogCollection, LogEntity } from "/imports/api/log/factory";
import { useFindFilter } from "/imports/api/log/publications";
import { Log } from "/imports/api/log/log";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as UrlTools from "/imports/utils/url-tools";
import * as Metatags from "/imports/utils/metatags";

import { Entry } from "./log-entry";

import "./styles.scss";

export function LogPage({
  query,
}: {
  // LogCollection.Filtering Params are allowed as data input
  query: Parameters<ReturnType<LogCollection["Filtering"]>["read"]>[0];
}) {
  const batchLoad = 100;

  const { t } = useTranslation();
  const user = useUser();

  const [limit, setLimit] = useState(batchLoad);

  const filter = Log.Filtering();

  // Update whenever filter changes

  // Have some extra log entries ready so that they are shown immediately
  // when more are demanded
  const overLimit = limit + batchLoad + 1;
  // Read URL state
  const [isLoading, logs] = useFindFilter(filter.clear().read(query).done().toQuery(), overLimit);

  function updateUrl() {
    const filterParams = filter.toParams();
    const queryString = UrlTools.paramsToQueryString(filterParams);

    const options: { query?: string } = {};

    if (queryString.length) {
      options.query = queryString;
    }

    routerAutoscroll.cancelNext();

    const router = Router.current();
    Router.go(router.route.getName(), {}, options);

    return true;
  }

  function privileged() {
    return user?.privileged("admin");
  }
  function date() {
    const start = filter.get("start");
    return start?.toISOString() || "";
  }
  function relFilter() {
    const { rel } = filter.toParams();
    return rel || "";
  }
  function trFilter() {
    const { tr } = filter.toParams();
    return tr || "";
  }
  function hasMore() {
    return (logs.length || 0) > limit;
  }
  function results() {
    const entries = logs.slice(0, limit) || [];
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
  }

  // Update the URI when the search-field was changed an loses focus
  function onChange() {}

  const onTrackChange = debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
    filter.disable("tr");

    const trStr = (event.target as any).value.trim();
    if (trStr) {
      filter.add("tr", trStr);
    }

    filter.done();
    updateUrl();
  }, 200);

  const onDateChange = debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
    const dateStr = (event.target as any).value.trim();
    if (dateStr === "") {
      filter.disable("start").done();
    } else {
      filter.add("start", dateStr).done();
    }
    updateUrl();
  }, 200);

  const onIdChange = debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
    filter.disable("rel");

    const relStr = (event.target as any).value.trim();
    if (relStr) {
      filter.add("rel", relStr);
    }

    filter.done();
    updateUrl();
  }, 200);

  const onTrackClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, track: string) => {
    filter.add("tr", track);
    if (!event.shiftKey) {
      filter.done();
      updateUrl();
      window.scrollTo(0, 0);
    }
  };

  const onDateClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, newDate: Date) => {
    const start = moment(newDate).toISOString();
    filter.add("start", start);
    if (!event.shiftKey) {
      filter.done();
      updateUrl();
      window.scrollTo(0, 0);
    }
  };

  const onIdClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    filter.add("rel", id);
    if (!event.shiftKey) {
      filter.done();
      updateUrl();
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    Metatags.setCommonTags(t("log.list.windowtitle", "Log"));
  });

  if (!privileged()) {
    return <h1>PLZ login as admin!</h1>;
  }

  return (
    <>
      <div className="page-component">
        <div>
          <div className="input-group">
            <span className="input-group-text">ID</span>
            <input
              className="form-control"
              type="text"
              value={relFilter()}
              placeholder="Pw8HSnHtjErhPfCaa, f59a1e7855"
              onChange={onChange}
              onKeyUp={onIdChange}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text">Track</span>
            <input
              className="form-control"
              type="text"
              value={trFilter()}
              placeholder="Profile.Region"
              onChange={onChange}
              onKeyUp={onTrackChange}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text">Date</span>
            <input
              className="form-control"
              type="text"
              value={date()}
              placeholder="YYYY-MM-DD hh:mm:ss"
              onChange={onChange}
              onKeyUp={onDateChange}
            />
          </div>
        </div>
      </div>
      <div className="page-component log-pane">
        {isLoading() && (
          <div className="loading">
            <h1>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <marquee>&nbsp;&nbsp;&nbsp;LOADING! BE PATIENT! ENJOY THE SUN!</marquee>
            </h1>
          </div>
        )}
        <table className="table">
          <tr>
            <th>ID</th>
            <th>Track</th>
            <th>Timestamp</th>
            <th>Rel</th>
            <th>Body</th>
          </tr>

          {results().map((entry) => (
            <Entry
              key={"interval" in entry ? entry.interval : entry._id}
              entry={entry}
              onTrackClick={onTrackClick}
              onDateClick={onDateClick}
              onIdClick={onIdClick}
            />
          ))}

          {!!results() && !isLoading() && (
            <tr>
              <td>Nothing found.</td>
            </tr>
          )}
        </table>

        {hasMore() && (
          <div className="text-center">
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                setLimit(limit + 100);
              }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LogPage", () => LogPage);
