import $ from "jquery";
import React, { ReactNode, useEffect, useRef } from "react";

import { useWindowSize } from "/imports/ui/lib/useWindowSize";

import select2 from "select2";

import "./styles.scss";

(select2 as any)();

export function ReactSelect2(props: {
  className?: string | undefined;
  multiple?: boolean | undefined;
  value?: string | number | readonly string[] | undefined;
  placeholder: string;
  noResults: string;
  children: ReactNode;
  onSelect: (value: string) => void;
  onUnselect: (value: string) => void;
  disabled?: boolean | undefined;
}) {
  useWindowSize();

  const selectRef = useRef(null);

  useEffect(() => {
    if (!selectRef.current) {
      return;
    }

    const $select = $(selectRef.current);

    $select
      .select2({
        theme: "bootstrap",
        templateResult(data: any) {
          // We only really care if there is an element to pull classes from
          if (!data.element) {
            return data.text;
          }

          const $element = $(data.element);

          const $wrapper = $("<span></span>");
          $wrapper.addClass($element[0].className);

          $wrapper.text(data.text);

          return $wrapper;
        },
        placeholder: props.placeholder,
        language: {
          noResults() {
            return props.noResults;
          },
        },
        disabled: props.disabled,
      })
      .on("select2:select", (event) => {
        props.onSelect(event.params.data.id);
      })
      .on("select2:unselect", (event) => {
        props.onUnselect(event.params.data.id);
      });

    return () => {
      $select.select2("destroy");
    };
  }, [selectRef.current, props.placeholder, props.noResults]);

  return (
    <select
      ref={selectRef}
      className={props.className}
      multiple={props.multiple}
      value={props.value}
    >
      {props.children}
    </select>
  );
}
