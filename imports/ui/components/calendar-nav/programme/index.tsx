import React, { useRef } from "react";
import moment from "moment";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import { FilterGroups } from "/imports/ui/components/filter-groups";

import { SearchField } from "../../search-field";
import { FilterCategories } from "../../filter-categories";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import "../styles.scss";

export interface Props {
  hideSwitches: boolean;
  search: string;
  onChangeSearch: (newValue: string) => void;
  days: moment.Moment[];
  selectedDays: moment.Moment[];
  onAddDay: (day: moment.Moment) => void;
  onRemoveDay: (day: moment.Moment) => void;
  availableGroups: string[];
  selectedGroups: string[];
  onAddGroup: (group: string) => void;
  onRemoveGroup: (group: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onChangeAttendingEventsOnly: (state: boolean) => void;
}

export function CalendarNavProgramme(props: Props) {
  const { hideSwitches, days, availableGroups } = props;
  const currentUser = useUser();
  const { t } = useTranslation();
  const { weekdayFormat } = useDateTimeFormat();

  const elementRef = useRef(null);

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

  return (
    <div className="calendar-nav-container flex-container d-block" ref={elementRef}>
      <div className="row align-items-center px-1">
        <div className="col-md-3 col-lg-4 p-1">
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className="col-md-3 col-lg-4 p-1">
          {!hideSwitches && (
            <div className="row">
              {days.map((d) => (
                <div key={d.toISOString()} className="col px-1">
                  <div className="d-grid">
                    {props.selectedDays.find((s) => s.isSame(d)) ? (
                      <button
                        type="button"
                        className="btn bg-white btn-lg d-block active"
                        data-bs-toggle="button"
                        aria-pressed="true"
                        onClick={() => props.onRemoveDay(d)}
                      >
                        {weekdayFormat(d)}{" "}
                        <i className="fa-solid fa-check fa-fw text-success" aria-hidden="true"></i>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn bg-white btn-lg d-block"
                        data-bs-toggle="button"
                        onClick={() => props.onAddDay(d)}
                      >
                        {weekdayFormat(d)} <i className="fa fa-fw" aria-hidden="true"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="row align-items-center px-1">
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
          <div className="col-md-4 col-lg-2 p-1">
            <FilterCategories {...filterCategoriesAttr()} />
          </div>
        )}
      </div>
      {!!currentUser && (
        <div className="row align-items-center px-1">
          <div className={`col-md-8 col-lg-4 p-1`}>
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
        </div>
      )}
    </div>
  );
}
