import React from "react";
import { useTranslation } from "react-i18next";

import { useSessionEquals } from "/imports/utils/react-meteor-data";

type Direction = "previous" | "next";

export function Control(data: {
  direction: Direction;
  date: moment.Moment;
  onChangeDate: (newDate: moment.Moment) => void;
}) {
  const { t } = useTranslation();
  const isRTL = useSessionEquals("textDirectionality", "rtl");

  function arrow() {
    let arrowIsRTL = isRTL;
    if (data.direction === "previous") {
      arrowIsRTL = !arrowIsRTL;
    }

    const direction = arrowIsRTL ? "left" : "right";
    return <span className={`fa-solid fa-arrow-${direction} fa-fw`} aria-hidden="true"></span>;
  }

  function text(direction: string, length: string) {
    return t(`calendar.${direction}.day.${length}`);
  }

  function handleChangeDateClick() {
    const amount = data.direction === "previous" ? -1 : 1;

    const newDate = data.date.add(amount, "day");

    data.onChangeDate(newDate);
  }

  return (
    <div className="col-auto px-4">
      <button type="button" className="btn btn-secondary" onClick={handleChangeDateClick}>
        {arrow()} <span className="d-none d-md-inline-block">{text(data.direction, "short")}</span>
      </button>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CalendarNavDayControl", () => Control);
