import moment from "moment";
import React, { FocusEventHandler, useEffect, useRef } from "react";
import { useSession } from "/imports/ui/hooks/react-meteor-data";
import { cx } from "/imports/utils/cx";

export function DateInput(props: {
  id?: string | undefined;
  className?: string | undefined;
  required?: boolean | undefined;
  /** min/start date, the expected format is "YYYY-MM-DD" */
  min?: string | undefined;
  /** max/end date, the expected format is "YYYY-MM-DD" */
  max?: string | undefined;
  /** expected format is "YYYY-MM-DD" */
  value: string;
  disabled?: boolean | undefined;
  onChange?:
    | ((
        /** in format "YYYY-MM-DD" */
        value: string,
      ) => void)
    | undefined;
  onFocus?: FocusEventHandler<HTMLElement> | undefined;
  onBlur?: FocusEventHandler<HTMLElement> | undefined;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: boolean | undefined;
}) {
  const { id, className, min, max, value, required, disabled, onChange, onFocus, onBlur } = props;
  const locale = useSession("locale");
  const elementRef = useRef(null);

  const DisplayFormat = "L";

  function toDisplay(date: string) {
    return moment.utc(date).format(DisplayFormat);
  }

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    $(element)
      .datepicker({
        language: moment.locale(),
        weekStart: moment.localeData().firstDayOfWeek(),
        autoclose: true,
        startDate: min ? toDisplay(min) : undefined,
        endDate: max ? toDisplay(max) : undefined,
        format: {
          toDisplay,
          toValue(date) {
            return moment.utc(date, DisplayFormat).toDate();
          },
        },
      })
      .on("changeDate", (ev: any) => {
        onChange?.(moment.utc(ev.target.value, DisplayFormat).format("YYYY-MM-DD"));
      });

    return () => {
      $(element).datepicker("destroy");
    };
  }, [locale, onChange, min, max]);

  return (
    <input
      ref={elementRef}
      id={id}
      type="text"
      className={cx("form-control", className)}
      value={toDisplay(value)}
      required={required}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-describedby={props["aria-describedby"]}
      aria-invalid={props["aria-invalid"]}
    />
  );
}
