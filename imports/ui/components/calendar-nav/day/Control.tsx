import React from "react";
import { useTranslation } from "react-i18next";

import { useSessionEquals } from "/imports/ui/hooks/react-meteor-data";

type Direction = "previous" | "next";

export interface Props {
  direction: Direction;
  date: moment.Moment;
  onChangeDate: (newDate: moment.Moment) => void;
}

export function Control(props: Props) {
  const { t } = useTranslation();
  const isRTL = useSessionEquals("textDirectionality", "rtl");

  function arrow() {
    let arrowIsRTL = isRTL;
    if (props.direction === "previous") {
      arrowIsRTL = !arrowIsRTL;
    }

    const direction = arrowIsRTL ? "left" : "right";
    return <i className={`fa-solid fa-arrow-${direction} fa-fw`} />;
  }

  function text() {
    if (props.direction === "previous") {
      return t("calendar.previous.day.short", "previous day");
    }
    return t("calendar.next.day.short", "next day");
  }

  function handleChangeDateClick() {
    const amount = props.direction === "previous" ? -1 : 1;

    const newDate = props.date.add(amount, "day");

    props.onChangeDate(newDate);
  }

  return (
    <div className="col-auto px-4">
      <button type="button" className="btn btn-secondary" onClick={handleChangeDateClick}>
        {arrow()} <span className="d-none d-md-inline-block">{text()}</span>
      </button>
    </div>
  );
}
