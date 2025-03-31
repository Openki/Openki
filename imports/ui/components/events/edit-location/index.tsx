import { EJSON } from "meteor/ejson";
import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { differenceBy, intersectionBy, map } from "lodash";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";

import * as Alert from "/imports/api/alerts/alert";
import { EventVenueEntity } from "/imports/api/events/events";
import { useDetails } from "/imports/api/regions/publications";
import { useFindFilter } from "/imports/api/venues/publications";
import { useUser } from "/imports/utils/react-meteor-data";

import {
  AsyncTypeahead,
  BaseMenuItem,
  Menu,
  MenuItem,
  RenderMenuProps,
  TypeaheadInputSingle,
} from "react-bootstrap-typeahead";
import { EditLocationMap } from "./edit-location-map";
import { Display } from "../../location/display";
import { ReactJoin } from "../../../../utils/ReactJoin";
import { VenueTag } from "../../venues/link";

function toEventVenue(v: EventVenueEntity) {
  return {
    _id: v._id,
    name: v.name,
    loc: v.loc,
    address: v.address,
    editor: v.editor,
    restrictedUse: v.restrictedUse,
  } as EventVenueEntity;
}

function filterUserVenues(user: UserModel | null, venues: EventVenueEntity[]) {
  let userVenues: EventVenueEntity[] = [];
  if (user?.venues?.length) {
    userVenues = venues.filter((v) => v._id && user.venues.includes(v._id)).map(toEventVenue);
  }
  return userVenues;
}

function CustomMenu({ results, menuProps }: { results: any[]; menuProps: RenderMenuProps }) {
  const { t } = useTranslation();
  const user = useUser();

  let vs = results as EventVenueEntity[];
  const userVenues = filterUserVenues(user, vs);
  const uvs = intersectionBy(vs, userVenues, (v) => v._id);
  vs = differenceBy(vs, uvs, (v) => v._id);
  return (
    <Menu {...menuProps} id="event-venue">
      {vs.length === 0 && (
        <>
          <BaseMenuItem disabled role="option">
            {menuProps.emptyLabel}
          </BaseMenuItem>
          <Menu.Divider />
        </>
      )}
      {uvs.length > 0 && (
        <>
          {uvs.map((venue, index) => (
            <MenuItem
              key={index}
              option={venue}
              position={index}
              className="bg-venue text-truncate"
            >
              <span className="fa-solid fa-house fa-fw" aria-hidden="true"></span>{" "}
              {ReactJoin([!!venue.name && <strong>{venue.name}</strong>, venue.address])}
            </MenuItem>
          ))}
          <Menu.Divider />
        </>
      )}
      {vs.length > 0 && (
        <>
          {vs.map((venue, index) => (
            <MenuItem
              key={index + uvs.length}
              option={venue}
              position={index + uvs.length}
              className={venue._id ? "bg-venue text-truncate" : ""}
            >
              {!!venue._id && (
                <>
                  <span
                    className={`fa-solid ${
                      !venue.restrictedUse ? "fa-house" : "fa-house-lock"
                    } fa-fw`}
                    aria-hidden="true"
                  ></span>{" "}
                </>
              )}
              {ReactJoin([!!venue.name && <strong>{venue.name}</strong>, venue.address])}
            </MenuItem>
          ))}
          <Menu.Divider />
        </>
      )}
      <div className="px-3">
        {t("profile.createNewVenue.question", "Are you responsible for a venue?")}
        <br />
        <a href={Router.path("venueDetails", { _id: "create" })} target="_blank">
          <span className="fa-solid fa-house fa-fw" aria-hidden="true"></span>{" "}
          {t(
            "profile.createNewVenue.linkText",
            "Set up a venue that is visible to others and can be reused.",
          )}
        </a>
      </div>
    </Menu>
  );
}

export function EditVenue({
  region: regionId,
  value,
  onChange,
}: {
  region: string;
  value?: EventVenueEntity | undefined;
  onChange: (newValue: EventVenueEntity | undefined) => void;
}) {
  const { t } = useTranslation();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVenues, venues] = useFindFilter({ region: regionId });
  const [isLoadingRegion, region] = useDetails(regionId);
  const [options, setOptions] = useState<EventVenueEntity[]>(filterUserVenues(user, venues));

  useEffect(() => {
    setOptions(filterUserVenues(user, venues));
  }, [EJSON.stringify([user, venues] as any)]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const nominatimQuery: Record<string, any> = {
      format: "json",
      q: query,
      layer: "address,poi",
      addressdetails: "1",
      limit: 10,
    };

    if (region && region.loc) {
      nominatimQuery.viewbox = [
        region.loc.coordinates[0] - 0.1,
        region.loc.coordinates[1] + 0.1,
        region.loc.coordinates[0] + 0.1,
        region.loc.coordinates[1] - 0.1,
      ].join(",");
    }
    nominatimQuery.bounded = 1;

    try {
      const request = fetch(
        `https://nominatim.openstreetmap.org?${new URLSearchParams(nominatimQuery)}`,
      );

      // eslint-disable-next-line no-param-reassign
      query = query.toUpperCase();
      const filteredVenues = venues
        .filter((venue) =>
          `${venue.short}, ${venue.name}, ${venue.address}`.toUpperCase().includes(query),
        )
        .map(toEventVenue);

      const response = await request;
      const found = await response.json();

      setOptions([
        ...filteredVenues,
        ...map(found, (foundLocation) => {
          const a = foundLocation.address;
          return {
            loc: {
              type: "Point" as const,
              coordinates: [
                Number.parseFloat(foundLocation.lon),
                Number.parseFloat(foundLocation.lat),
              ] as [long: number, lat: number],
            },
            address: [
              [a.road, a.house_number].filter((v) => v).join(" "),
              [a.postcode, a.state].filter((v) => v).join(" "),
            ]
              .filter((v) => v)
              .join(", "),
            name: foundLocation.name,
          };
        }),
      ]);
    } catch (reason) {
      Alert.serverError(reason);
    }
    setIsLoading(false);
  };

  if (isLoadingRegion() || isLoadingVenues()) {
    return null;
  }

  return (
    <>
      {!value ? (
        <div className="mb-3">
          <label className="form-label">
            {t("course.event.edit.location", "Venue")} <small>{t("_inputField.optional")}</small>
          </label>
          <AsyncTypeahead
            defaultSelected={value ? [value as any] : ([{}] as any)}
            filterBy={() => true}
            isLoading={isLoading}
            labelKey={(option) => {
              const venue = option as EventVenueEntity;
              return [venue.name, venue.address].filter((v) => v).join(", ");
            }}
            minLength={0}
            onSearch={handleSearch}
            // Max one request per second, source: https://operations.osmfoundation.org/policies/nominatim/
            delay={1010}
            useCache={false}
            options={options}
            promptText={t("_typeahead.promptText", "Type to search...")}
            searchText={t("_typeahead.searchText", "Searching...")}
            emptyLabel={t("_typeahead.emptyLabel", "No matches found.")}
            placeholder={
              t("event.edit.locationNamePlaceholder", "Search address or name of venue") || ""
            }
            renderInput={(inputProps, props) => {
              // From https://github.com/ericgio/react-bootstrap-typeahead/blob/924627376275c78988718230c0438748ff673a6d/src/components/Typeahead/Typeahead.tsx#L229
              const { isInvalid, isValid, size } = props as any;
              const commonProps = { ...inputProps, isInvalid, isValid, size };
              // Add type="search" to have a clear button
              return <TypeaheadInputSingle {...commonProps} type="search" />;
            }}
            renderMenu={(results, menuProps) => (
              <CustomMenu results={results} menuProps={menuProps} />
            )}
            onChange={(newValue) => {
              onChange(newValue[0] as EventVenueEntity);
            }}
          />
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
                  <div className="form-control">
                    <VenueTag venue={value} />
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
          {/* Not show hint if user is editor of venue */}
          {filterUserVenues(user, [value]).length === 0 &&
            (value.restrictedUse ? (
              <div className="alert alert-warning p-2">
                {t(
                  "event.editVenue.restrictedUse",
                  "This venue can only be chosen by its hosts to publish an event.",
                )}
              </div>
            ) : (
              <div className="alert alert-success p-2">
                {t(
                  "event.editVenue.pleaseContactHost",
                  "Make sure you have contacted the host of this venue for availability.",
                )}
              </div>
            ))}
          {!!value.loc && (
            <div className="mb-3">
              {!value._id ? (
                <>
                  <EditLocationMap
                    value={value.loc}
                    onChange={(newLoc) => {
                      onChange({ ...value, loc: newLoc });
                    }}
                  />
                  <div className="form-text">
                    {t(
                      "course.event.edit.locationMovePosition",
                      "You can drag the marker to the correct position.",
                    )}
                  </div>
                </>
              ) : (
                <Display coordinates={value.loc.coordinates} fullscreen={false} />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventEditVenue", () => EditVenue);
