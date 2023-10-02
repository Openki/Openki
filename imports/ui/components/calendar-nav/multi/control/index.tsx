import React from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals } from "/imports/utils/react-meteor-data";

const units = ["week", "month", "year"] as const;

export type Direction = "previous" | "next";
export type Unit = (typeof units)[number];

function Arrow(props: { direction: Direction }) {
  let isRTL = useSessionEquals("textDirectionality", "rtl");

  if (props.direction === "previous") {
    isRTL = !isRTL;
  }

  const direction = isRTL ? "left" : "right";

  return <span className={`fa-solid fa-arrow-${direction} fa-fw`} aria-hidden="true"></span>;
}

export function Control(props: {
  unit: Unit;
  direction: Direction;
  onChangeDate: () => void;
  onChangeUnit: (value: Unit) => void;
}) {
  const { unit: currentUnit, direction, onChangeDate, onChangeUnit } = props;
  const { t } = useTranslation();

  function calendarNavText(unit: string, length: string) {
    return t(`calendar.${direction}.${unit}.${length}`);
  }

  return (
    <div className="calendar-nav-control">
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={(event) => {
            event.preventDefault();
            onChangeDate();
          }}
        >
          <Arrow direction={direction} />{" "}
          <span className="d-none d-md-inline-block">{calendarNavText(currentUnit, "short")}</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          aria-expanded="false"
          aria-haspopup="true"
          data-bs-toggle="dropdown"
          data-bs-reference="parent"
        >
          <span className="fa-solid fa-list-ul fa-fw" aria-hidden="true"></span>
        </button>
        <ul className="dropdown-menu">
          {units.map((unit) => {
            return (
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onChangeUnit(unit);
                  }}
                >
                  {calendarNavText(unit, "long")}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CalendarNavMultiControl", () => Control);
