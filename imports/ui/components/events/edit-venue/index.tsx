import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { EventVenueEntity } from "/imports/api/events/events";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";

import { Display } from "../../location/display";
import { VenueTag } from "../../venues/link";
import { OtherEventsMessage } from "../edit/OtherEventsMessage";
import { useFindParallelEvents } from "../edit/useFindParallelEvents";
import { Map } from "./map";
import { filterUserVenues, Search } from "./search";

function Hints({
  venueId,
  regionId,
  event,
  errors,
}: {
  venueId: string | undefined;
  regionId: string;
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
  errors: Partial<Record<"venue" | "startEndVenue", string | React.JSX.Element | null | undefined>>;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [venueIsLoading, venue] = useVenueDetails(venueId || "-1");
  const parallelEvents = useFindParallelEvents(venueId, regionId, event);

  const inSameRoom = parallelEvents.find(
    (e) => e.room && event.room && e.room.toUpperCase() === event.room.toUpperCase(),
  );
  return (
    <>
      {!!errors.venue && <div className="text-danger mb-3">{errors.venue}</div>}
      {!!errors.startEndVenue && <div className="text-danger mb-3">{errors.startEndVenue}</div>}

      {!errors.venue && !errors.startEndVenue && !venueIsLoading() && !!venue && (
        <>
          {venue.allowParallelEvents && parallelEvents.length > 0 && (
            <div
              data-test="events-edit-venue-hint-parallel-events"
              className="alert alert-warning p-2"
            >
              <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>{" "}
              {t("event.edit.venue.parallelEvents.allowed", "Event is overlapping.")}{" "}
              {inSameRoom && (
                <>
                  {t(
                    "event.edit.venue.parallelEvents.sameRoom",
                    "Your event seem to be in same room as an other event.",
                  )}{" "}
                </>
              )}
              <OtherEventsMessage events={parallelEvents} />
            </div>
          )}

          {
            /* Not show hint if user is editor of venue */
            filterUserVenues(user, [venue]).length === 0 &&
              (venue.restrictedUse ? (
                <div
                  data-test="events-edit-venue-hint-restricted-use"
                  className="alert alert-warning p-2"
                >
                  <span
                    className="fa-solid fa-triangle-exclamation fa-fw"
                    aria-hidden="true"
                  ></span>{" "}
                  {t(
                    "event.editVenue.restrictedUse",
                    "This venue can only be chosen by its hosts to publish an event.",
                  )}
                </div>
              ) : (
                <div
                  data-test="events-edit-venue-hint-contact-host"
                  className="alert alert-success p-2"
                >
                  {t(
                    "event.editVenue.pleaseContactHost",
                    "Make sure you have contacted the host of this venue for availability.",
                  )}
                </div>
              ))
          }
        </>
      )}
    </>
  );
}

export function EditVenue({
  region: regionId,
  event,
  value,
  onChange,
  errors,
}: {
  region: string;
  value?: EventVenueEntity | undefined;
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
  onChange: (newValue: EventVenueEntity | undefined) => void;
  errors: Partial<Record<"venue" | "startEndVenue", string | React.JSX.Element | null | undefined>>;
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
          <Hints regionId={regionId} event={event} venueId={value._id} errors={errors} />
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
