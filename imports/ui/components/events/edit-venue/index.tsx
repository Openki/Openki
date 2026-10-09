import React, { FocusEventHandler, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash-es";

import { EventEntity } from "/imports/api/events/events";
import { isEventVenueRef } from "/imports/api/events/lib/isEventVenueRef";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { useDetails as useGroupDetails } from "/imports/api/groups/publications";
import { OrganizationEntity, OrganizationVenueRef } from "/imports/api/organizations/organizations";

import { cx } from "/imports/utils/cx";

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
  value?: EventEntity["venue"] | undefined;
  event: {
    _id?: string | undefined;
    groupId?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
  onChange: (newValue: EventEntity["venue"] | undefined) => void;
  errors: Partial<Record<"venue" | "startEndVenue", ReactNode>>;
  onBlur: FocusEventHandler<HTMLInputElement>;
}

function getVenueIds(groups: OrganizationEntity[] = []): OrganizationVenueRef["_id"][] {
  const venueIds: OrganizationVenueRef["_id"][] = [];

  for (const group of groups) {
    for (const venue of group.venues ?? []) {
      if (venue) {
        venueIds.push(venue._id);
      }
    }
  }

  return venueIds;
}

export function EditVenue({ region: regionId, event, value, onChange, errors, onBlur }: Props) {
  const { t } = useTranslation();
  const [autofocusOnSearch, setAutoFocusOnSearch] = useState(false);

  const [isGroupLoading, group] = useGroupDetails({ when: !!event?.groupId }, event?.groupId);
  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter(
    { when: !!group?.teamOrganizations },
    { ids: group?.teamOrganizations },
  );

  if (isGroupLoading() || organizationsIsLoading()) {
    return null;
  }

  return (
    <fieldset id="edit-venue">
      {!value || isEmpty(value) ? (
        <div className="mb-3">
          <label className="form-label" htmlFor="event-edit-venue-search">
            {t("group.event.edit.location", "Venue")}
          </label>
          <Search
            id="event-edit-venue-search"
            autofocus={autofocusOnSearch}
            region={regionId}
            venues={getVenueIds(organizations)}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={cx(
              "form-control",
              errors.venue || errors.startEndVenue ? "is-invalid" : "mb-md-3",
            )}
          />
          {!!errors.venue && <small className="text-danger mb-3">{errors.venue}</small>}
        </div>
      ) : (
        <>
          <div className={cx("row", !errors.venue && !errors.startEndVenue && "mb-md-3")}>
            <div className="col-md-4 mb-3 mb-md-0">
              {!isEventVenueRef(value) ? (
                <FormControl
                  id="event-edit-venue-displayVenueAs"
                  type="text"
                  label={t("group.event.edit.locationName", "Display venue as")}
                  value={value.name}
                  onChange={(name) => onChange({ ...value, name })}
                  onBlur={onBlur}
                />
              ) : (
                <>
                  <label className="form-label">
                    {t("group.event.edit.selectedVenue", "Selected venue")}
                  </label>
                  <div
                    className={cx(
                      "form-control d-flex align-items-center",
                      (!!errors.venue || !!errors.startEndVenue) && "is-invalid",
                    )}
                  >
                    <VenueTag className="flex-fill" venue={value} openInNewTab />
                    <button
                      type="button"
                      className="btn-close btn-close-black ms-2"
                      onClick={() => onChange(undefined)}
                      aria-label={t("_button.clear", "Clear")}
                    ></button>
                  </div>
                </>
              )}
            </div>
            <div className="col-md-5 mb-3 mb-md-0">
              <FormControl
                id="event-edit-venue-locationAddress"
                type="text"
                label={t("group.event.edit.locationAddress", "Address")}
                value={value.address || ""}
                onChange={
                  !isEventVenueRef(value) ? (address) => onChange({ ...value, address }) : undefined
                }
                disabled={isEventVenueRef(value)}
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
                  {t("group.event.edit.locationResetButton", "Search other place")}
                </Button>
              </div>
            </div>
          </div>
          {!!errors.venue && <small className="text-danger mb-3">{errors.venue}</small>}
          {!!errors.startEndVenue && (
            <small className="text-danger mb-3">{errors.startEndVenue}</small>
          )}
          {isEventVenueRef(value) && !errors.venue && !errors.startEndVenue && (
            <Hints regionId={regionId} event={event} venue={value} />
          )}
          {isEventVenueRef(value) && (
            <div className="mb-3">
              <Timetable regionId={regionId} event={event} venueId={value._id} />
            </div>
          )}
          {!!value.loc && (
            <div className="mb-3">
              {!isEventVenueRef(value) ? (
                <>
                  <Map
                    region={regionId}
                    value={{ location: value.loc, level: value.level }}
                    onChange={(newValue) => {
                      if (newValue.level === undefined) {
                        onChange({ ...value, loc: newValue.location });
                      } else {
                        onChange({ ...value, loc: newValue.location, level: newValue.level });
                      }
                    }}
                  />
                  <div className="form-text text-end">
                    {t(
                      "group.event.edit.locationMovePosition",
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
    </fieldset>
  );
}
