import moment from "moment";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { FilterGroups, Props as FilterGroupsProps } from "../../FilterOrganizations";
import { FilterCategories, Props as FilterCategoriesProps } from "../../filter-categories";
import { SearchField, Props as SearchFieldProps } from "../../search-field";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { FormCheck } from "/imports/ui/components/FormCheck";

import "../styles.scss";

export interface Props {
  hideSwitches?: boolean | undefined;
  hideCategories?: boolean | undefined;
  search: string | undefined;
  onChangeSearch: (newValue: string) => void;
  days: moment.Moment[];
  selectedDays: moment.Moment[];
  onAddDay: (day: moment.Moment) => void;
  onRemoveDay: (day: moment.Moment) => void;
  availableGroups?: string[] | undefined;
  selectedGroups?: string[] | undefined;
  onAddGroup: (group: string) => void;
  onRemoveGroup: (group: string) => void;
  categories?: string[] | undefined;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  attendingEventsOnly: boolean;
  onChangeAttendingEventsOnly: (state: boolean) => void;
}

export function CalendarNavProgram(props: Props) {
  const { hideSwitches, days, availableGroups } = props;
  const currentUser = useUser();
  const { t } = useTranslation();
  const { dayOfWeekShort, dayOfWeekLong } = useDateTimeFormat();

  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenSM;
  const isDesktopScreen = viewport.width > ScssVars.screenMD;

  const elementRef = useRef(null);

  function searchFieldAttr(): SearchFieldProps {
    return { search: props.search, onChange: props.onChangeSearch };
  }
  function filterGroupsAttr(): FilterGroupsProps {
    return {
      availableGroups: props.availableGroups,
      selectedGroups: props.selectedGroups,
      onAdd: props.onAddGroup,
      onRemove: props.onRemoveGroup,
    };
  }
  function filterCategoriesAttr(): FilterCategoriesProps {
    return {
      categories: props.categories,
      onAdd: props.onAddCategory,
      onRemove: props.onRemoveCategory,
    };
  }

  return (
    <div className="calendar-nav-container d-block" ref={elementRef}>
      <div className="container py-1">
        <div className="row align-items-center px-1">
          <div className="col-md-8 col-lg-6 p-1">
            <SearchField {...searchFieldAttr()} color="primary" />
          </div>
        </div>
        <div className="row align-items-center px-1">
          {!!availableGroups?.length && (
            <div className="col-md-4 col-lg-3 p-1">
              <FilterGroups {...filterGroupsAttr()} />
            </div>
          )}
          {!props.hideCategories && (
            <div className="col-md-4 col-lg-3 p-1">
              <FilterCategories {...filterCategoriesAttr()} />
            </div>
          )}
          {!!currentUser && (
            <div className="col-md-8 col-lg-6 p-1">
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
        <div
          className={
            "row align-items-center px-1 align-items-stretch " + (isDesktopScreen ? "gap-4" : "")
          }
        >
          {!hideSwitches &&
            days.map((d) => (
              <div key={d.toISOString()} className="col p-1">
                <div className="d-grid h-100">
                  {props.selectedDays.find((s) => s.isSame(d)) ? (
                    <button
                      type="button"
                      className={`btn ${isMobileScreen ? "p-1" : ""} btn-lg btn-primary text-white border-dark d-block active`}
                      data-bs-toggle="button"
                      aria-pressed="true"
                      onClick={() => props.onRemoveDay(d)}
                    >
                      {isMobileScreen ? dayOfWeekShort(d) : dayOfWeekLong(d)}{" "}
                      <span className="checkmark fa-solid fa-check"></span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn ${isMobileScreen ? "p-1" : ""} btn-lg bg-white text-body-secondary d-block`}
                      data-bs-toggle="button"
                      onClick={() => props.onAddDay(d)}
                    >
                      {isMobileScreen ? dayOfWeekShort(d) : dayOfWeekLong(d)}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
