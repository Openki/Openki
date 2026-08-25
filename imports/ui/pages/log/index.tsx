import React, { useCallback, useMemo, useState } from "react";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { debounce } from "lodash-es";

import { LogCollection, LogEntity } from "/imports/api/log/factory";
import { useFindFilter } from "/imports/api/log/publications";
import { Log } from "/imports/api/log/log";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { MetaTags } from "/imports/ui/components/MetaTags";

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

  const filter = Log.Filtering().read(query);

  // Update whenever filter changes

  // Have some extra log entries ready so that they are shown immediately
  // when more are demanded
  const overLimit = limit + batchLoad + 1;
  // Read URL state
  const [isLoading, logs] = useFindFilter(filter.toQuery(), overLimit);

  function updateUrl() {
    const query = filter.toParams();

    routerAutoscroll.cancelNext();

    const router = Router.current();
    Router.go(router.route.getName(), {}, { query });

    return true;
  }

  function privileged() {
    return user?.hasPrivilege("admin");
  }
  function dateFilter() {
    const { start } = filter.toParams();
    return start || "";
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

  const [track, setTrack] = useState(trFilter() || "");
  const handleTrackSearch = useMemo(
    () =>
      debounce((newValue: string) => {
        setTrack(newValue);
        filter.disable("tr");

        const trStr = newValue.trim();
        if (trStr) {
          filter.set("tr", trStr);
        }
        updateUrl();
      }, 200),
    [],
  );
  const handleTrackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTrack(event.currentTarget.value);
    handleTrackSearch(event.currentTarget.value);
  };

  const [date, setDate] = useState(dateFilter() || "");
  const handleDateSearch = useMemo(
    () =>
      debounce((newValue: string) => {
        setDate(newValue);
        const dateStr = newValue.trim();
        if (dateStr === "") {
          filter.disable("start");
        } else {
          filter.set("start", dateStr);
        }

        updateUrl();
      }, 200),
    [],
  );
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.currentTarget.value);
    handleDateSearch(event.currentTarget.value);
  };

  const [id, setId] = useState(relFilter() || "");
  const handleIdSearch = useMemo(
    () =>
      debounce((newValue: string) => {
        setId(newValue);
        filter.disable("rel");

        const relStr = newValue.trim();
        if (relStr) {
          filter.set("rel", relStr);
        }

        updateUrl();
      }, 200),
    [],
  );
  const handleIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setId(event.currentTarget.value);
    handleIdSearch(event.currentTarget.value);
  };

  const onTrackClick = useCallback((newTrack: string) => {
    filter.set("tr", newTrack);
    setTrack(trFilter());
    updateUrl();
    window.scrollTo(0, 0);
  }, []);

  const onDateClick = useCallback((newDate: Date) => {
    filter.set("start", moment(newDate));
    setDate(dateFilter());
    updateUrl();
    window.scrollTo(0, 0);
  }, []);

  const onIdClick = useCallback((newId: string) => {
    filter.set("rel", newId);
    setId(relFilter());
    updateUrl();
    window.scrollTo(0, 0);
  }, []);

  if (!privileged()) {
    return <h1>PLZ login as admin!</h1>;
  }

  return (
    <>
      <MetaTags title={t("log.list.windowtitle", "Log")} />

      <div className="page-component">
        <div>
          <div className="input-group">
            <span className="input-group-text">ID</span>
            <input
              className="form-control"
              type="text"
              value={id}
              placeholder="Pw8HSnHtjErhPfCaa, f59a1e7855"
              onChange={handleIdChange}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text">Track</span>
            <input
              className="form-control"
              type="text"
              value={track}
              placeholder="Profile.Region"
              onChange={handleTrackChange}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text">Date</span>
            <input
              className="form-control"
              type="text"
              value={date}
              placeholder="YYYY-MM-DD hh:mm:ss"
              onChange={handleDateChange}
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

          {results().map((entry, i) => (
            <Entry
              key={"interval" in entry ? i : entry._id}
              entry={entry}
              onTrackClick={onTrackClick}
              onDateClick={onDateClick}
              onIdClick={onIdClick}
            />
          ))}

          {!results().length && !isLoading() && (
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

import "./template.html";

Template.registerHelper("LogPage", () => LogPage);
