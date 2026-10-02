import moment from "moment";
import React, { useRef, useEffect } from "react";
import { useSession } from "/imports/ui/hooks/react-meteor-data";
import { todayOrAfter } from "../../lib/todayOrAfter";

import "./styles.scss";

export function DateSelect({
  id,
  value,
  multiple,
  onChange,
}:
  | {
      id?: string | undefined;
      value: moment.Moment;
      multiple?: false | undefined;
      onChange?: (newValue: moment.Moment) => void;
    }
  | {
      id?: string | undefined;
      value: number[];
      multiple: true;
      onChange?: (newValues: number[]) => void;
    }) {
  const locale = useSession("locale");
  const elementRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    if (!multiple) {
      $(element)
        .datepicker({
          weekStart: moment.localeData().firstDayOfWeek(),
          language: moment.locale(),
          autoclose: true,
          startDate: new Date(),
          format: {
            toDisplay(date) {
              return moment.utc(date).format("L");
            },
            toValue(date) {
              return moment.utc(date, "L").toDate();
            },
          },
        })
        .on("change keyup", function () {
          const newValue = moment(element.value, "L");
          onChange?.(newValue);
        });
    } else {
      $(element)
        .datepicker({
          weekStart: moment.localeData().firstDayOfWeek(),
          language: moment.locale(),
          multidate: true,
          multidateSeparator: ", ",
          todayHighlight: true,
          startDate: new Date(),
        })
        .datepicker("setDates", value)
        .on("changeDate", function (e: { dates: number[] }) {
          onChange?.(e.dates);
        });
    }

    return () => {
      $(element).datepicker("destroy");
    };
  }, [locale]);

  if (!multiple) {
    return (
      <div className="input-group">
        <span className="input-group-text">
          <i className="fa-regular fa-calendar-days fa-fw" />
        </span>
        <input
          ref={elementRef}
          id={id}
          type="text"
          className="form-control"
          size={8}
          value={todayOrAfter(value).format("L")}
        />
        <span className="date-select-weekday">{moment(value).format("ddd")}</span>
      </div>
    );
  }

  return <div ref={elementRef}></div>;
}
