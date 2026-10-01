import React, { useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { useUser } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { cx } from "/imports/utils/cx";

import { Control } from "./Control";
import { FilterOrganizations } from "../../FilterOrganizations";
import { Direction } from "../Arrow";
import { SearchField } from "../../search-field";
import { FilterCategories } from "../../filter-categories";
import { FormCheck } from "/imports/ui/components/FormCheck";

import "../styles.scss";

export interface Props {
  hideSwitches: boolean;
  search: string;
  onChangeSearch: (newValue: string) => void;
  date: moment.Moment;
  onChangeDate: (newDate: moment.Moment) => void;
  availableOrganizations: string[];
  selectedOrganizations: string[];
  onChangeOrganizations: (organizations: string[]) => void;
  categories: string[];
  onChangeCategories: (categories: string[]) => void;
  attendingEventsOnly: boolean;
  onChangeAttendingEventsOnly: (state: boolean) => void;
}

export function CalendarNavWeek(props: Props) {
  const { hideSwitches, date, availableOrganizations } = props;
  const { t } = useTranslation();
  const currentUser = useUser();
  const { weekNr, dateLong, dateShort } = useDateTimeFormat();
  const [covering, setCovering] = useState(false);

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
  function filterOrganizationsAttr() {
    return {
      availableOrganizations: props.availableOrganizations,
      selectedOrganizations: props.selectedOrganizations,
      onChange: props.onChangeOrganizations,
    };
  }
  function filterCategoriesAttr() {
    return {
      categories: props.categories,
      onChange: props.onChangeCategories,
    };
  }

  useEffect(() => {
    const handleScroll = () => {
      const atTop = window.scrollY < 5;
      setCovering(!atTop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cx(
        "flex-container calendar-nav-container",
        covering && "calendar-nav-container-covering",
      )}
      style={{ display: "block" }}
    >
      <div className="row align-items-center p-1">
        <div className="col-md-3 col-lg-4 p-1">
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className="col-md-6 col-lg-4 p-1">
          <div className="row justify-content-center align-items-center">
            {!hideSwitches && <Control {...controlAttr("previous")} />}
            <div className="col-auto text-center">
              <div className="fs-4">
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
            {!hideSwitches && <Control {...controlAttr("next")} />}
          </div>
        </div>
        <div className="row align-items-center">
          {availableOrganizations ? (
            <>
              <div className="col-md-3 col-lg-2 p-1">
                <FilterOrganizations {...filterOrganizationsAttr()} />
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
          {!!currentUser && (
            <div className="col-md-8 col-lg-4 p-1 d-flex justify-content-center">
              <FormCheck
                id="filter-own-events"
                type="switch"
                label={t("calendar.filter-own-events", "Show my events only")}
                onChange={(checked) => props.onChangeAttendingEventsOnly(checked)}
                checked={props.attendingEventsOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
