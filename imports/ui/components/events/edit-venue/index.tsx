import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { chain, isEmpty } from "lodash-es";

import { EventVenueEntity } from "/imports/api/events/events";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { useDetails as useGroupDetails } from "/imports/api/courses/publications";

import { Display } from "../../location/display";
import { VenueTag } from "../../venues/link";
import { Hints } from "./Hints";
import { Map } from "./map";
import { Search } from "./search";
import { Timetable } from "./Timetable";
import { FormControl } from "/imports/ui/components/form-control";
import { Button } from "/imports/ui/components/Buttons";

export interface Props {
  region: string;
  value?: EventVenueEntity | undefined;
  event: {
    _id?: string | undefined;
    courseId?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
  onChange: (newValue: EventVenueEntity | undefined) => void;
  errors: Partial<Record<"venue" | "startEndVenue", ReactNode>>;
}

export function EditVenue({ region: regionId, event, value, onChange, errors }: Props) {
  const { t } = useTranslation();
  const [autofocusOnSearch, setAutoFocusOnSearch] = useState(false);

  const [isGroupLoading, group] = useGroupDetails({ when: !!event?.courseId }, event?.courseId);
  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter(
    { when: !!group?.teamOrganizations },
    { ids: group?.teamOrganizations },
  );

  if (isGroupLoading() || organizationsIsLoading()) {
    return null;
  }

  return (
    <>
      {!value || isEmpty(value) ? (
        <div className="mb-3">
          <label className="form-label" htmlFor="event-edit-venue-search">
            {t("course.event.edit.location", "Venue")} <small>{t("_inputField.optional")}</small>
          </label>
          <Search
            id="event-edit-venue-search"
            autofocus={autofocusOnSearch}
            region={regionId}
            venues={chain(organizations)
              .flatMap((o) => o.venues)
              .filter((v) => !!v)
              .map((v) => v._id)
              .value()}
            value={value}
            onChange={onChange}
          />
        </div>
      ) : (
        <>
          <div className={`row ${!errors.venue && !errors.startEndVenue ? "mb-md-3" : ""}`}>
            <div className="col-md-4 mb-3 mb-md-0">
              {!value._id ? (
                <FormControl
                  id="event-edit-venue-displayVenueAs"
                  type="text"
                  label={t("course.event.edit.locationName", "Display venue as")}
                  value={value.name}
                  onChange={(name) => onChange({ ...value, name })}
                />
              ) : (
                <>
                  <label className="form-label">
                    {t("course.event.edit.selectedVenue", "Selected venue")}
                  </label>
                  <div
                    className={`form-control d-flex align-items-center ${errors.venue || errors.startEndVenue ? "is-invalid" : ""}`}
                  >
                    <VenueTag className="flex-fill" venue={value} openInNewTab />
                    <button
                      type="button"
                      className="btn-close btn-close-black ms-2"
                      onClick={() => onChange(undefined)}
                    ></button>
                  </div>
                </>
              )}
            </div>
            <div className="col-md-5 mb-3 mb-md-0">
              <FormControl
                id="event-edit-venue-locationAddress"
                type="text"
                label={t("course.event.edit.locationAddress", "Address")}
                value={value.address || ""}
                onChange={!value._id ? (address) => onChange({ ...value, address }) : undefined}
                disabled={!!value._id}
              />
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="form-label d-none d-md-block">&nbsp;</div>
              <div className="d-grid">
                <Button
                  id="event-edit-venue-reset"
                  className="btn-secondary"
                  onClick={() => {
                    onChange(undefined);
                    setAutoFocusOnSearch(true);
                  }}
                >
                  {t("course.event.edit.locationResetButton", "Search other place")}
                </Button>
              </div>
            </div>
          </div>
          {!!errors.venue && <div className="text-danger mb-3">{errors.venue}</div>}
          {!!errors.startEndVenue && <div className="text-danger mb-3">{errors.startEndVenue}</div>}
          {!errors.venue && !errors.startEndVenue && (
            <Hints regionId={regionId} event={event} venue={value} />
          )}
          {!!value._id && (
            <div className="mb-3">
              <Timetable regionId={regionId} event={event} venueId={value._id} />
            </div>
          )}
          {!!value.loc && (
            <div className="mb-3">
              {!value._id ? (
                <>
                  <Map
                    region={regionId}
                    value={{ location: value.loc, level: value.level }}
                    onChange={(newValue) => {
                      if (newValue.level === undefined)
                        onChange({ ...value, loc: newValue.location });
                      else onChange({ ...value, loc: newValue.location, level: newValue.level });
                    }}
                  />
                  <div className="form-text text-end">
                    {t(
                      "course.event.edit.locationMovePosition",
                      "You can drag the marker to the correct position.",
                    )}
                  </div>
                </>
              ) : (
                <Display
                  region={regionId}
                  coordinates={value.loc.coordinates}
                  level={value.level}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
