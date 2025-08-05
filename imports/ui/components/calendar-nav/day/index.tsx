import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { SearchField } from "../../search-field";
import { Control } from "./Control";
import { FilterGroups } from "../../filter-groups";
import { FilterCategories } from "../../filter-categories";
import { Direction } from "../Arrow";

import "../styles.scss";

export interface Data {
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

export function Day(data: Data) {
  const { t } = useTranslation();
  const { weekNr, dateLong, dateShort } = useDateTimeFormat();
  const [covering, setCovering] = useState(false);
  const currentUser = useUser();
  const navRef = useRef<HTMLDivElement>(null);

  function controlAttr(direction: Direction) {
    return { direction, date: data.date, onChangeDate: data.onChangeDate };
  }
  function searchFieldAttr() {
    return { search: data.search, onChange: data.onChangeSearch };
  }
  function filterGroupsAttr() {
    return {
      availableGroups: data.availableGroups,
      selectedGroups: data.selectedGroups,
      onAdd: data.onAddGroup,
      onRemove: data.onRemoveGroup,
    };
  }
  function filterCategoriesAttr() {
    return {
      categories: data.categories,
      onAdd: data.onAddCategory,
      onRemove: data.onRemoveCategory,
    };
  }

  useEffect(() => {
    if (navRef.current) {
      $(navRef.current).slideDown();
    }

    const handleScroll = () => {
      const atTop = window.scrollY < 5;
      setCovering(!atTop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`calendar-nav-container${covering ? " calendar-nav-container-covering" : ""}`}
      ref={navRef}
    >
      <div className="row align-items-center p-1">
        <div className="col-md-3 col-lg-4 p-1">
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className="col-md-6 col-lg-4 p-1">
          <div className="row justify-content-center align-items-center">
            {!data.hideSwitches && <Control {...controlAttr("previous")} />}
            <div className="col-auto">
              <div className="lead">
                <span className="d-none d-md-inline-block">{dateLong(data.date)}</span>
                <span className="d-md-none">{dateShort(data.date)}</span>
              </div>
              <div>
                {t("calendar.weekNumber", "Week")} {weekNr(data.date)}
              </div>
            </div>
            {!data.hideSwitches && <Control {...controlAttr("next")} />}
          </div>
        </div>
        <div className="row align-items-center p-1">
          {!!data.availableGroups && (
            <div className="col-md-4 col-lg-2 p-1">
              <FilterGroups {...filterGroupsAttr()} />
            </div>
          )}
          <div className="col-md-4 col-lg-2 p-1">
            <FilterCategories {...filterCategoriesAttr()} />
          </div>
          {!!currentUser && (
            <div
              className={`${data.availableGroups ? "offset-md-4 offset-lg-2 " : ""}col-md-8 col-lg-4 p-1`}
            >
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  id="filter-own-events"
                  className="form-check-input float-none "
                  name="filter-own-events"
                  onChange={(event) => {
                    const radioSwitch = event.currentTarget;
                    data.onChangeAttendingEventsOnly(radioSwitch.checked);
                  }}
                />{" "}
                <label htmlFor="filter-own-events">
                  {t("calendar.filter-own-events", "Show my events only")}
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CalendarNavDay", () => Day);
