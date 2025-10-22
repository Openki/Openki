import React from "react";
import { useTranslation } from "react-i18next";

import { EventVenueEntity } from "/imports/api/events/events";

import { Map } from "./map";
import { Search } from "./search";
import { Display } from "../../location/display";
import { VenueTag } from "../../venues/link";

export function EditVenue({
  region: regionId,
  value,
  onChange,
  errors,
  warnings,
}: {
  region: string;
  value?: EventVenueEntity | undefined;
  onChange: (newValue: EventVenueEntity | undefined) => void;
  errors: Partial<Record<"venue" | "startEndVenue", string | React.JSX.Element | null | undefined>>;
  warnings: Partial<
    Record<"venue" | "startEndVenue", string | React.JSX.Element | null | undefined>
  >;
}) {
  const { t } = useTranslation();

  return (
    <>
      {!value ? (
        <div className="mb-3">
          <label className="form-label">
            {t("course.event.edit.location", "Venue")} <small>{t("_inputField.optional")}</small>
          </label>
          <Search regionId={regionId} value={value} onChange={onChange} />
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-4 mb-3">
              {!value._id ? (
                <>
                  <label className="form-label" id="displayVenueAs">
                    {t("course.event.edit.locationName", "Display venue as")}
                  </label>
                  <input
                    name="displayVenueAs"
                    type="text"
                    className="form-control"
                    value={value.name}
                    onChange={(e) => {
                      onChange({ ...value, name: e.currentTarget.value });
                    }}
                  />
                </>
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
            <div className="col-md-5 mb-3">
              <label className="form-label">
                {t("course.event.edit.locationAddress", "Address")}
              </label>
              <input
                type="text"
                className="form-control"
                value={value.address}
                onChange={
                  !value._id
                    ? (e) => {
                        onChange({ ...value, address: e.currentTarget.value });
                      }
                    : undefined
                }
                disabled={!!value._id}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label d-none d-md-block">&nbsp;</label>
              <div className="d-grid">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => onChange(undefined)}
                >
                  {t("course.event.edit.locationResetButton", "Search other place")}
                </button>
              </div>
            </div>
          </div>
          {errors.startEndVenue ? (
            <div className="text-danger mb-3">{errors.startEndVenue}</div>
          ) : errors.venue ? (
            <div className="text-danger mb-3">{errors.venue}</div>
          ) : (
            warnings.venue || warnings.startEndVenue
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
