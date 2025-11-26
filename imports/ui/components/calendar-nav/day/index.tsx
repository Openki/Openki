import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { FilterGroups, Props as FilterGroupsProps } from "../../FilterGroups";
import { FilterCategories, Props as FilterCategoriesProps } from "../../filter-categories";
import { SearchField, Props as SearchFieldProps } from "../../search-field";
import { Direction } from "../Arrow";
import { Control, Props as ControlProps } from "./Control";
import { FormCheck } from "/imports/ui/components/FormCheck";

import "../styles.scss";

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
  isAttendeeFilterOn: boolean;
  onChangeAttendingEventsOnly: (state: boolean) => void;
}

export function Day(props: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const { weekNr, dateLong, dateShort } = useDateTimeFormat();
  const [covering, setCovering] = useState(false);

  function controlAttr(direction: Direction): ControlProps {
    return { direction, date: props.date, onChangeDate: props.onChangeDate };
  }
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
      className={`calendar-nav-container${covering ? " calendar-nav-container-covering" : ""}`}
      style={{ display: "block" }}
    >
      <div className="row align-items-center p-1">
        <div className="col-md-3 col-lg-4 p-1">
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className="col-md-6 col-lg-4 p-1">
          <div className="row justify-content-center align-items-center">
            {!props.hideSwitches && <Control {...controlAttr("previous")} />}
            <div className="col-auto">
              <div className="lead">
                <span className="d-none d-md-inline-block">{dateLong(props.date)}</span>
                <span className="d-md-none">{dateShort(props.date)}</span>
              </div>
              <div>
                {t("calendar.weekNumber", "Week")} {weekNr(props.date)}
              </div>
            </div>
            {!props.hideSwitches && <Control {...controlAttr("next")} />}
          </div>
        </div>
      </div>
      <div className="row align-items-center p-1">
        {!!props.availableGroups && (
          <div className="col-md-4 col-lg-2 p-1">
            <FilterGroups {...filterGroupsAttr()} />
          </div>
        )}
        <div className="col-md-4 col-lg-2 p-1">
          <FilterCategories {...filterCategoriesAttr()} />
        </div>
        {!!currentUser && (
          <div
            className={`${props.availableGroups ? "offset-md-4 offset-lg-2 " : ""}col-md-8 col-lg-4 p-1`}
          >
            <FormCheck
              id="filter-own-events"
              type="switch"
              label={t("calendar.filter-own-events", "Show my events only")}
              onChange={(checked) => props.onChangeAttendingEventsOnly(checked)}
              checked={props.isAttendeeFilterOn}
            />
          </div>
        )}
      </div>
    </div>
  );
}
