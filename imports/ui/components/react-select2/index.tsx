import React, { useEffect, useRef } from "react";
import $ from "jquery";

import { useWindowSize } from "/imports/ui/lib/useWindowSize";

import select2 from "select2";
import "select2/dist/css/select2.min";
import "select2-theme-bootstrap5/dist/select2-bootstrap.min";

import "./styles.scss";

(select2 as any)();

export function ReactSelect2(props: {
  className?: string;
  multiple?: boolean;
  defaultValue?: string | number | readonly string[] | undefined;
  placeholder: string;
  noResults: string;
  children: any;
  onSelect: (value: string) => void;
  onUnselect: (value: string) => void;
}) {
  useWindowSize();

  const selectRef = useRef(null);

  useEffect(() => {
    if (!selectRef.current) {
      return;
    }

    $(selectRef.current)
      .on("select2:select", (event) => {
        props.onSelect(event.params.data.id);
      })
      .on("select2:unselect", (event) => {
        props.onUnselect(event.params.data.id);
      });
  });

  useEffect(() => {
    if (!selectRef.current) {
      return;
    }

    const $select = $(selectRef.current);
    if ($select.hasClass("select2-hidden-accessible")) {
      // Select2 has been initialized
      $select.select2("destroy");
    }
  });

  useEffect(() => {
    if (!selectRef.current) {
      return;
    }
    $(selectRef.current).select2({
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
    });
  });

  return (
    <select
      ref={selectRef}
      className={props.className}
      multiple={props.multiple}
      defaultValue={props.defaultValue}
    >
      {props.children}
    </select>
  );
}
