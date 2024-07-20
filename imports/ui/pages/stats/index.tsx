/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useTranslation } from "react-i18next";

import * as StatsMethods from "/imports/api/stats/methods";
import { Stats } from "/imports/api/stats/stats";

import { useSession, useUser } from "/imports/utils/react-meteor-data";

import { useAll, useDetails } from "/imports/api/regions/publications";

import { LoadingPage } from "../loading";

import "./styles.scss";

export function StatsPage() {
  const { t } = useTranslation();
  const user = useUser();
  const regionSession = useSession("region");
  const searchParams = useSearchParams();

  function getRegionFromQuery() {
    const region: string = searchParams.region || regionSession;

    return region || "all";
  }

  const [region, setRegion] = useState(getRegionFromQuery());
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [isLoadingCurrent, currentRegion] = useDetails(region);
  const [isLoadingAll, regions] = useAll();

  useEffect(() => {
    setStats(undefined);
    StatsMethods.region(region).then((s) => {
      setStats(s);
    });
  }, [region]);

  function isAdmin() {
    return user?.privileged("admin");
  }
  function regionName() {
    return currentRegion?.name || "";
  }

  function selectedRegion(r = "all") {
    return r === region ? { selected: true } : {};
  }

  return (
    <div className="container">
      {!isAdmin() ? (
        <h1>{t("region.stats.plzLogin", "PLZ login as admin!")}</h1>
      ) : !isLoadingCurrent() && !isLoadingAll() && stats ? (
        <>
          <div>
            <select
              className="form-select form-select-lg w-auto"
              onChange={(event) => {
                setRegion(event.currentTarget.value);
              }}
            >
              <option value="all" {...selectedRegion()}>
                {t("region.stats.allRegions", "All regions")}
              </option>
              {regions.map((r) => (
                <option key={r._id} value={r._id} {...selectedRegion(r._id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <h1 className="mt-5">
            {regionName()
              ? t("region.list.titleForRegion", "Overview {REGION}", { REGION: regionName })
              : t("region.list.title", "Regions")}
          </h1>
          <table className="stats">
            <thead>
              <tr>
                <th className="course-stat" colSpan={1}>
                  {t("region.stats.courses", "Courses")}
                </th>
                <th className="event-stat" colSpan={2}>
                  {t("region.stats.events", "Events")}
                </th>{" "}
                {/*
                <th>{t("region.stats.usersParticipating", "Users participating")}</th> */}
              </tr>
              <tr>
                <th className="course-stat">{t("region.stats.courses.total", "Total")}</th>
                {/* <th className="course-stat">{t("region.stats.courses.active", "Active")}</th> */}
                <th className="event-stat">{t("region.stats.events.total", "Total")}</th>
                {/*   <th className="event-stat">{t("region.stats.events.future", "Future")}</th>
                <th>&nbsp;</th> */}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="course-stat number">
                  {t("region.stats.courses.total.description", "excl. archived")}
                </td>
                <td className="event-stat number"></td>
              </tr>
              <tr>
                <td className="course-stat number">
                  <strong>{stats.region.courses.total}</strong>
                </td>
                {/* <td className="course-stat numer">
                  <strong>{regionStats.total.activeCourses}</strong>
                </td>
                <td className="event-stat number">
                  <strong>{regionStats.total.passedEvents}</strong>
                </td> */}
                <td className="event-stat number">
                  <strong>{stats.region.events.total}</strong>
                </td>
                {/*    <td className="number">
                  <strong>{regionStats.total.usersParticipating}</strong>
                </td> */}
              </tr>
            </tbody>
          </table>
          {/* <div className="mt-5">
            <h2>{t("regions.stats.header", "Group statistics")}</h2>
            <table className="stats">
              <thead>
                <tr>
                  <th>{t("region.stats.group", "Group")}</th>
                  <th className="course-stat" colSpan={2}>{t("region.stats.courses", "Courses")}</th>
                  <th className="event-stat" colSpan={2}>
                    {t("region.stats.events", "Events")}
                  </th>
                  <th>{t("region.stats.usersParticipating", "Users participating")}</th>
                </tr>
                <tr>
                  <th>&nbsp;</th>
                  <th className="course-stat">{t("region.stats.courses.total", "Total")}</th>
                  <th className="course-stat">{t("region.stats.courses.active", "Active")}</th>
                  <th className="event-stat">{t("region.stats.events.passed", "Passed")}</th>
                  <th className="event-stat">{t("region.stats.events.future", "Future")}</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.group.groups.map((group) => {
                  return (
                    <tr>
                      <td>
                        {group.id ? (
                          <a href={Router.path("groupDetails", { _id: group.id })}>{group.name}</a>
                        ) : (
                          t("region.stats.ungrouped", "Ungrouped")
                        )}
                      </td>
                      <td className="course-stat number">{group.numCourses}</td>
                      <td className="course-stat number">{group.activeCourses}</td>
                      <td className="event-stat number">{group.passedEvents}</td>
                      <td className="event-stat number">{group.futureEvents}</td>
                      <td className="number">{group.usersParticipating}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td>
                    <strong>{t("region.stats.total", "Total")}</strong>
                  </td>
                  <td
                    className="course-stat number"
                    title={t(
                      "region.stats.multipleParticipate",
                      "Some users participate in multiple events",
                    )}
                  >
                    <strong>{regionStats.total.numCourses}</strong>
                  </td>
                  <td className="course-stat number">
                    <strong>{regionStats.group.total.activeCourses}</strong>
                  </td>
                  <td className="event-stat number">
                    <strong>{regionStats.group.total.passedEvents}</strong>
                  </td>
                  <td className="event-stat number">
                    <strong>{regionStats.group.total.futureEvents}</strong>
                  </td>
                  <td className="number">
                    <strong>{regionStats.group.total.usersParticipating}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> */}
        </>
      ) : (
        <LoadingPage />
      )}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("StatsPage", () => StatsPage);
