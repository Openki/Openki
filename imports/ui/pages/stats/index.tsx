import React, { useEffect, useState } from "react";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as StatsMethods from "/imports/api/stats/methods";
import { Stat, Stats } from "/imports/api/stats/stats";

import { useSession, useUser } from "/imports/utils/react-meteor-data";

import { useAll, useDetails } from "/imports/api/regions/publications";

import { LoadingPage } from "../loading";

import "./styles.scss";

function Header() {
  const { t } = useTranslation();
  return (
    <>
      <th className="group-stat" colSpan={7} style={{ height: "4.5em" }}>
        {t("region.stats.groups", "Groups")}
      </th>
      <th className="event-stat" colSpan={9} style={{ height: "4.5em" }}>
        {t("region.stats.events", "Events")}
      </th>
    </>
  );
}

function SubHeader() {
  const { t } = useTranslation();
  return (
    <>
      <th className="group-stat">{t("region.stats.groups.total", "Total")}</th>
      <th className="group-stat">{t("region.stats.groups.proposed", "Proposed")}</th>
      <th className="group-stat">{t("region.stats.groups.resting", "Resting")}</th>
      <th className="group-stat">{t("region.stats.groups.upcoming", "Upcoming")}</th>
      <th className="group-stat">{t("region.stats.groups.archived", "Archived")}</th>
      <th className="group-stat">{t("region.stats.groups.enrollments", "Group enrollments")}</th>
      <th className="group-stat">{t("region.stats.groups.users", "Users")}</th>
      <th className="event-stat">{t("region.stats.events.total", "Total")}</th>
      <th className="event-stat">{t("region.stats.events.future", "Future")}</th>
      <th className="event-stat">{t("region.stats.events.passed", "Passed")}</th>
      <th className="event-stat">{t("region.stats.events.canceled", "Canceled")}</th>
      <th className="event-stat">{t("region.stats.events.fullyBooked", "Fully booked")}</th>
      <th className="event-stat">{t("region.stats.events.totalRsvps", "RSVPs Total")}</th>
      <th className="event-stat">{t("region.stats.events.canceledRsvps", "RSVPs in canceled")}</th>
      <th className="event-stat">{t("region.stats.events.futureRsvps", "RSVPs in future")}</th>
      <th className="event-stat">{t("region.stats.events.users", "Users")}</th>
    </>
  );
}

function Descriptions() {
  const { t } = useTranslation();
  return (
    <>
      <td className="description">
        {t("region.stats.groups.total.description", "excl. archived")}
      </td>
      <td className="description">{t("region.stats.groups.proposed.description", "no events")}</td>
      <td className="description">
        {t("region.stats.groups.resting.description", "only passed events")}
      </td>
      <td className="description">
        {t("region.stats.groups.upcoming.description", "with planned event(s)")}
      </td>
      <td className="description">&nbsp;</td>
      <td className="description">
        {t("region.stats.groups.enrollments.description", "interested or any role, incl. creator")}
      </td>
      <td className="description">
        {t("region.stats.groups.users.description", "unique accounts enrolled")}
      </td>
      <td className="description">
        {t("region.stats.events.total.description", "incl. canceled")}
      </td>
      <td className="description">
        {t("region.stats.events.future.description", "excl. canceled")}
      </td>
      <td className="description">
        {t("region.stats.events.passed.description", "excl. canceled")}
      </td>
      <td className="description">
        {t("region.stats.events.canceled.description", "in future and passed")}
      </td>
      <td className="description">
        {t("region.stats.events.fullyBooked.description", "in future and passed")}
      </td>
      <td className="description">
        {t(
          "region.stats.events.totalRsvps.description",
          "in future and passed, incl. +1, canceled events excluded",
        )}
      </td>
      <td className="description">
        {t(
          "region.stats.events.canceledRsvps.description",
          "RSVPs in canceled events, incl. +1 and passed",
        )}
      </td>
      <td className="description">
        {t(
          "region.stats.events.futureRsvps.description",
          "in future events only, incl. +1, excl. canceled events",
        )}
      </td>
      <td className="description">
        {t("region.stats.events.users.description", "unique accounts registered")}
      </td>
    </>
  );
}

function Results({ stat }: { stat: Stat }) {
  return (
    <>
      <td className="group-stat number">{stat.groups.total}</td>
      <td className="group-stat number">{stat.groups.proposed}</td>
      <td className="group-stat number">{stat.groups.resting}</td>
      <td className="group-stat number">{stat.groups.upcoming}</td>
      <td className="group-stat number">{stat.groups.archived}</td>
      <td className="group-stat number">{stat.groups.enrollments}</td>
      <td className="group-stat number">{stat.groups.users}</td>
      <td className="event-stat number">{stat.events.total}</td>
      <td className="event-stat number">{stat.events.future}</td>
      <td className="event-stat number">{stat.events.passed}</td>
      <td className="event-stat number">{stat.events.canceled}</td>
      <td className="event-stat number">{stat.events.fullyBooked}</td>
      <td className="event-stat number">{stat.events.totalRsvps}</td>
      <td className="event-stat number">{stat.events.canceledRsvps}</td>
      <td className="event-stat number">{stat.events.futureRsvps}</td>
      <td className="event-stat number">{stat.events.users}</td>
    </>
  );
}

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
    return user?.hasPrivilige("admin");
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
              : t("region.list.title", "Overiew")}
          </h1>
          <table className="table-hover-vertical stats">
            <thead>
              <tr>
                <Header />
              </tr>
              <tr>
                <SubHeader />
              </tr>
            </thead>
            <tbody>
              <tr>
                <Descriptions />
              </tr>
              <tr>
                <Results stat={stats.region} />
              </tr>
            </tbody>
          </table>
          <div className="mt-5">
            <h2>{t("regions.stats.header", "Organization statistics")}</h2>
            <table className="table-hover-vertical stats">
              <thead>
                <tr>
                  <th colSpan={2}>{t("region.stats.organization", "Organization")}</th>
                  <Header />
                </tr>
                <tr>
                  <th>&nbsp;</th>
                  <th>{t("region.stats.organization.members", "Members")}</th>
                  <SubHeader />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <Descriptions />
                </tr>
                {stats.organizations.map((organization, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {organization._id ? (
                          <a href={Router.path("organizationDetails", organization)}>
                            {organization.name || t("organization.missing")}
                          </a>
                        ) : (
                          t("region.stats.noOrganization", "Not assigned to any organization")
                        )}
                      </td>
                      <td>{organization.members}</td>
                      <Results stat={organization} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <LoadingPage />
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("StatsPage", () => StatsPage);
