import React, { useEffect, useState } from "react";
import { EJSON } from "meteor/ejson";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { intersectionBy, differenceBy, map } from "lodash-es";

import { UserModel } from "/imports/api/users/users";
import * as Alert from "/imports/api/alerts/alert";
import { EventVenueEntity } from "/imports/api/events/events";
import * as Regions from "/imports/api/regions/publications";
import * as Venues from "/imports/api/venues/publications";
import { useUser } from "/imports/utils/react-meteor-data";

import {
  AsyncTypeahead,
  BaseMenuItem,
  Menu,
  MenuItem,
  RenderMenuProps,
  TypeaheadInputSingle,
} from "react-bootstrap-typeahead";
import { ReactJoin } from "../../../../../utils/ReactJoin";
import { Icon as VenueIcon } from "../../../venues/Icon";

function toEventVenue(v: EventVenueEntity) {
  return {
    _id: v._id,
    name: v.name,
    loc: v.loc,
    level: v.level,
    address: v.address,
    editor: v.editor,
    restrictedUse: v.restrictedUse,
  } as EventVenueEntity;
}

export function filterUserVenues(user: UserModel | null, venues: EventVenueEntity[]) {
  let userVenues: EventVenueEntity[] = [];
  if (user?.venues?.length) {
    userVenues = venues.filter((v) => v._id && user.venues.includes(v._id)).map(toEventVenue);
  }
  return userVenues;
}

function CustomMenu({
  region: regionId,
  text,
  results,
  menuProps,
}: {
  region: string;
  text: string;
  results: any[];
  menuProps: RenderMenuProps;
}) {
  const { t } = useTranslation();
  const user = useUser();
  const [isLoading, region] = Regions.useDetails(regionId);

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
              <i className="fa-solid fa-house-user fa-fw" />{" "}
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
              className={
                venue._id
                  ? !venue.restrictedUse
                    ? "bg-venue text-truncate"
                    : "text-venue-restricted-use bg-venue-locked text-truncate"
                  : ""
              }
            >
              {!!venue._id && (
                <>
                  <VenueIcon id={venue._id} restrictedUse={venue.restrictedUse} />{" "}
                </>
              )}
              {ReactJoin([
                !!venue.name && (
                  <>
                    <strong>{venue.name}</strong>
                    {!!venue.restrictedUse && (
                      <> {t("location.link.restrictedUse", "(only restricted use)")}</>
                    )}
                  </>
                ),
                venue.address,
              ])}
            </MenuItem>
          ))}
          <Menu.Divider />
        </>
      )}
      <MenuItem
        option={isLoading() ? {} : ({ loc: region?.loc, name: text } as EventVenueEntity)}
        position={uvs.length + uvs.length + 1}
      >
        <i className="fa-solid fa-location-pin fa-fw" />{" "}
        {t("location.setMeetingPoint", "Just set a point on the map")}
      </MenuItem>
      <Menu.Divider />
      <div className="px-3">
        {t("profile.createNewVenue.question", "Are you responsible for a venue?")}
        <br />
        <a href={Router.path("venueDetails", { _id: "create" })} target="_blank" rel="noreferrer">
          <i className="fa-solid fa-house fa-fw" />{" "}
          {t(
            "profile.createNewVenue.linkText",
            "Set up a venue that is visible to others and can be reused.",
          )}
        </a>
      </div>
    </Menu>
  );
}

export function Search({
  id,
  autofocus,
  regionId,
  value,
  onChange,
}: {
  id: string;
  autofocus?: boolean | undefined;
  regionId: string;
  value: EventVenueEntity | undefined;
  onChange: (newValue: EventVenueEntity) => void;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingVenues, venues] = Venues.useFindFilter({ region: regionId });
  const [isLoadingRegion, region] = Regions.useDetails(regionId);
  const [options, setOptions] = useState<EventVenueEntity[]>(filterUserVenues(user, venues));

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

  useEffect(() => {
    setOptions(filterUserVenues(user, venues));
  }, [EJSON.stringify([user, venues] as any)]);

  if (isLoadingRegion() || isLoadingVenues()) {
    return null;
  }

  return (
    <AsyncTypeahead
      id="edit-venue-typeahead"
      defaultSelected={value ? [value as any] : ([{}] as any)}
      filterBy={() => true}
      isLoading={isLoading}
      labelKey={(option) => {
        const venue = option as EventVenueEntity;
        return [venue.name, venue.address].filter((v) => v).join(", ");
      }}
      minLength={0}
      onSearch={handleSearch} // Max one request per second, source: https://operations.osmfoundation.org/policies/nominatim/
      delay={1010}
      useCache={false}
      options={options}
      promptText={t("_typeahead.promptText", "Type to search...")}
      searchText={t("_typeahead.searchText", "Searching...")}
      emptyLabel={t("_typeahead.emptyLabel", "No matches found.")}
      placeholder={t("event.edit.locationNamePlaceholder", "Search address or name of venue") || ""}
      renderInput={(inputProps, props) => {
        // From https://github.com/ericgio/react-bootstrap-typeahead/blob/924627376275c78988718230c0438748ff673a6d/src/components/Typeahead/Typeahead.tsx#L229
        // eslint-disable-next-line react/prop-types
        const { isInvalid, isValid, size } = props as any;
        const commonProps = { ...inputProps, id, isInvalid, isValid, size };

        // Add type="search" to have a clear button
        return <TypeaheadInputSingle {...commonProps} type="search" autoFocus={autofocus} />;
      }}
      renderMenu={(results, menuProps, state) => (
        <CustomMenu region={regionId} results={results} menuProps={menuProps} text={state.text} />
      )}
      onChange={(newValue) => onChange(newValue[0] as EventVenueEntity)}
    />
  );
}
