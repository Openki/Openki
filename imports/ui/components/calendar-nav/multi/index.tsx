import $ from "jquery";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { Router } from "meteor/iron:router";
import moment from "moment";

import { Events } from "/imports/api/events/events";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { useCurrentRouteName } from "/imports/utils/react-meteor-router";

import { Direction, Unit } from "../Arrow";
import { Control } from "./Control";
import { FormCheck } from "/imports/ui/components/FormCheck";

import "../styles.scss";

function updateUrl(routerName: string, filter: ReturnType<(typeof Events)["Filtering"]>) {
  const query = filter.toParams();
  delete query.region; // HACK region is kept in the session (for bad reasons)
  Router.go(routerName, {}, { query });
}

function mvDateHandler(
  routerName: string,
  unit: Unit,
  direction: Direction,
  filter: ReturnType<(typeof Events)["Filtering"]>,
) {
  const amount = direction === "previous" ? -1 : 1;
  const start = filter.get("start") as moment.Moment;
  const weekCorrection = unit === "week" ? 0 : 1;

  if (amount < 0) {
    start.add(amount, unit).startOf("week");
  } else {
    start.add(amount, unit).add(weekCorrection, "week").startOf("week");
  }
  filter.set("start", start);
  updateUrl(routerName, filter);
  return false;
}

export interface Props {
  date: moment.Moment;
  filter: ReturnType<(typeof Events)["Filtering"]>;
  isAttendeeFilterOn: boolean;
  setIsAttendeeFilterOn: (state: boolean) => void;
}

export function Multi({ date, filter, isAttendeeFilterOn, setIsAttendeeFilterOn }: Props) {
  const { t } = useTranslation();
  const { weekNr, dateLong, dateShort } = useDateTimeFormat();
  const currentUser = useUser();
  const routerName = useCurrentRouteName();

  const [currentUnit, setCurrentUnit] = useState<Unit>("week");

  function endDateTo() {
    return moment(date).add(6, "days");
  }

  function controlAttr(direction: Direction) {
    const unit = currentUnit;
    return {
      unit,
      direction,
      onChangeDate: () => {
        mvDateHandler(routerName, unit, direction, filter);
      },
      onChangeUnit: (value: Unit) => {
        setCurrentUnit(value);
        mvDateHandler(routerName, value, direction, filter);
      },
    };
  }

  useEffect(() => {
    const navContainer = $(".calendar-nav-container");
    navContainer.slideDown();

    $(window).on("scroll", () => {
      const isCovering = navContainer.hasClass("calendar-nav-container-covering");
      const atTop = ($(window).scrollTop() || 0) < 5;

      if (!isCovering && !atTop) {
        navContainer.addClass("calendar-nav-container-covering");
      } else if (isCovering && atTop) {
        navContainer.removeClass("calendar-nav-container-covering");
      }
    });
  });

  return (
    <div className="calendar-nav-container text-center">
      <div className="calendar-nav">
        <Control {...controlAttr("previous")} />
        <div className="calendar-nav-moment">
          <div className="fs-4">
            {t("calendar.weekNumber", "Week")} {weekNr(date)}
          </div>
          <div>
            <span className="d-none d-md-inline-block">
              {dateLong(date)} - {dateLong(endDateTo())}
            </span>
            <span className="d-md-none">
              {dateShort(date)} - {dateShort(endDateTo())}
            </span>
          </div>
        </div>
        <Control {...controlAttr("next")} />
      </div>
      {!!currentUser && (
        <div className="d-flex align-content-center justify-content-center pb-2">
          <FormCheck
            id="filter-own-events"
            type="switch"
            label={t("calendar.filter-own-events", "Show my events only")}
            onChange={(checked) => setIsAttendeeFilterOn(checked)}
            checked={isAttendeeFilterOn}
          />
        </div>
      )}
    </div>
  );
}
