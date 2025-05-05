import React, { useEffect, useRef } from "react";
import $ from "jquery";
import moment from "moment";
import { useUser } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useTranslation } from "react-i18next";

import { Control } from "./Control";
import { FilterGroups } from "/imports/ui/components/filter-groups";
import { Direction } from "../Arrow";

import "../styles.scss";
import { SearchField } from "../../search-field";
import { FilterCategories } from "../../filter-categories";

export interface Props {
  hideSwitches: boolean;
  search: string;
  onChangeSearch: (newValue: string) => void;
  date: moment.Moment;
  onChangeDate: (newDate: moment.Moment) => void;
  availableGroups: string[];
  selectedGroups: string[];
  onAddGroup: (group: string) => void;
  onRemoveGroup: (group: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onChangeAttendingEventsOnly: (state: boolean) => void;
}

export function CalendarNavWeek(props: Props) {
  const { hideSwitches, date, availableGroups } = props;
  const { weekNr, dateLong, dateShort } = useDateTimeFormat();
  const currentUser = useUser();
  const { t } = useTranslation();
  const elementRef = useRef(null);

  function endDateTo() {
    return moment(date).add(6, "days");
  }

  function controlAttr(direction: Direction) {
    return {
      direction,
      onChangeDate: () => {
        const amount = direction === "previous" ? -7 : 7;

        const newDate = props.date.add(amount, "day");

        props.onChangeDate(newDate);
      },
    };
  }

  function searchFieldAttr() {
    return { search: props.search, onChange: props.onChangeSearch };
  }
  function filterGroupsAttr() {
    return {
      availableGroups: props.availableGroups,
      selectedGroups: props.selectedGroups,
      onAdd: props.onAddGroup,
      onRemove: props.onRemoveGroup,
    };
  }
  function filterCategoriesAttr() {
    return {
      categories: props.categories,
      onAdd: props.onAddCategory,
      onRemove: props.onRemoveCategory,
    };
  }

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    const navContainer = $(elementRef.current);
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
    <div className="calendar-nav-container flex-container" ref={elementRef}>
      <div className="row align-items-center p-1">
        <div className="col-md-3 col-lg-4 p-1">
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className="col-md-6 col-lg-4 p-1">
          <div className="row justify-content-center align-items-center">
            {!hideSwitches ? <Control {...controlAttr("previous")} /> : null}
            <div className="col-auto text-center">
              <div className="lead">
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
            {!hideSwitches ? <Control {...controlAttr("next")} /> : null}
          </div>
        </div>
        <div className="row align-items-center">
          {availableGroups ? (
            <>
              <div className="col-md-3 col-lg-2 p-1">
                <FilterGroups {...filterGroupsAttr()} />
              </div>
              <div className="col-md-3 col-lg-2 p-1">
                <FilterCategories {...filterCategoriesAttr()} />
              </div>
            </>
          ) : (
            <div className="offset-lg-2 col-md-4 col-lg-2 p-1">
              <FilterCategories {...filterCategoriesAttr()} />
            </div>
          )}
        </div>
        {currentUser ? (
          <div
            className={`${!availableGroups ? "offset-md-4 offset-lg-2 " : ""}col-md-8 col-lg-4 p-1`}
          >
            <div className="form-check form-switch">
              <input
                type="checkbox"
                id="filter-own-events"
                className="form-check-input float-none"
                name="filter-own-events"
                onClick={(event) => {
                  const radioSwitch = event.currentTarget;
                  props.onChangeAttendingEventsOnly(radioSwitch.checked);
                }}
              />{" "}
              <label htmlFor="filter-own-events">
                {t("calendar.filter-own-events", "Show my events only")}
              </label>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CalendarNavWeek", () => CalendarNavWeek);
