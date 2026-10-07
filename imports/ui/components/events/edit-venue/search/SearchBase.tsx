import React, { FocusEventHandler, useEffect, useState } from "react";
import { EJSON } from "meteor/ejson";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { differenceBy, isUndefined, omitBy, uniqBy } from "lodash-es";

import { UserModel } from "/imports/api/users/users";
import * as Alert from "/imports/api/alerts/alert";
import { EventVenue, EventVenueRef } from "/imports/api/events/events";
import { isEventVenueRef } from "/imports/api/events/lib/isEventVenueRef";
import * as Regions from "/imports/api/regions/publications";
import * as Venues from "/imports/api/venues/publications";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import {
  AsyncTypeahead,
  BaseMenuItem,
  Menu,
  MenuItem,
  RenderMenuProps,
  TypeaheadInputSingle,
} from "react-bootstrap-typeahead";
import { ReactJoin } from "/imports/utils/ReactJoin";
import { Icon as VenueIcon } from "../../../venues/Icon";
import { VenueEntity } from "/imports/api/venues/venues";
import { cx } from "/imports/utils/cx";

function toEventVenue(venue: VenueEntity | EventVenueRef) {
  // ignore undefined props
  return omitBy(
    {
      _id: venue._id,
      name: venue.name,
      loc: venue.loc,
      level: venue.level,
      address: venue.address,
      editor: venue.editor,
      restrictedUse: venue.restrictedUse,
    },
    isUndefined,
  ) as EventVenueRef;
}

export function filterUserVenues(user: UserModel | null, venues: (EventVenue | EventVenueRef)[]) {
  let userVenues: EventVenueRef[] = [];
  if (user?.venues?.length) {
    userVenues = venues
      .filter((v) => isEventVenueRef(v) && user.venues.includes(v._id))
      .map((v) => toEventVenue(v as EventVenueRef));
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
  results: (EventVenue | EventVenueRef)[];
  menuProps: RenderMenuProps;
}) {
  const { t } = useTranslation();
  const user = useUser();
  const [isLoading, region] = Regions.useDetails(regionId);

  const userVenues = filterUserVenues(user, results);

  const venues = differenceBy(results, userVenues, (v) => (isEventVenueRef(v) ? v._id : undefined));

  return (
    <Menu {...menuProps} id="event-venue">
      {venues.length === 0 && (
        <>
          <BaseMenuItem disabled role="option">
            {menuProps.emptyLabel}
          </BaseMenuItem>
          <Menu.Divider />
        </>
      )}
      {userVenues.length > 0 && (
        <>
          {userVenues.map((venue, index) => (
            <MenuItem
              key={index}
              option={venue}
              position={index}
              className="bg-venue text-truncate"
            >
              <i className="fa-solid fa-house-user fa-fw" />{" "}
              {ReactJoin([
                !!venue.name && <span className="fw-bold" key={venue.name}>{venue.name}</span>,
                venue.address,
              ])}
            </MenuItem>
          ))}
          <Menu.Divider />
        </>
      )}
      {venues.length > 0 && (
        <>
          {venues.map((venue, index) => (
            <MenuItem
              key={index + userVenues.length}
              option={venue}
              position={index + userVenues.length}
              className={cx(
                isEventVenueRef(venue) && !venue.restrictedUse
                  ? "bg-venue text-truncate"
                  : "text-venue-restricted-use bg-venue-locked text-truncate",
              )}
            >
              {isEventVenueRef(venue) && (
                <>
                  <VenueIcon id={venue._id} restrictedUse={venue.restrictedUse} />{" "}
                </>
              )}
              {ReactJoin([
                !!venue.name && (
                  <>
                    <span className="fw-bold">{venue.name}</span>
                    {isEventVenueRef(venue) && !!venue.restrictedUse && (
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
        option={
          isLoading() ? {} : ({ loc: region?.map?.center || region?.loc, name: text } as EventVenue)
        }
        position={userVenues.length + userVenues.length + 1}
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
export function SearchBase({
  id,
  className = "",
  autofocus,
  region,
  venues: venueIds,
  onRequest,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  className?: string | undefined;
  autofocus?: boolean | undefined;
  region: string;
  /** A selection of venues proposed to the user. */
  venues: VenueEntity["_id"][];
  onRequest: (query: string) => Promise<EventVenue[]>;
  value: EventVenue | EventVenueRef | undefined;
  onChange: (newValue: EventVenue | EventVenueRef | undefined) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingAllVenues, allVenues] = Venues.useFindFilter({ region: region });

  const [options, setOptions] = useState<(EventVenue | EventVenueRef)[]>([]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);

    try {
      const request = onRequest(query);

      query = query.toUpperCase();
      const filteredVenues = allVenues
        .filter((venue) =>
          `${venue.short}, ${venue.name}, ${venue.address}`.toUpperCase().includes(query),
        )
        .map(toEventVenue);

      const externalVenues = await request;

      setOptions([...filteredVenues, ...externalVenues] as (EventVenue | EventVenueRef)[]);
    } catch (reason) {
      Alert.serverError(reason);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const userVenues = filterUserVenues(user, allVenues);
    const venues = allVenues.filter((v) => venueIds.includes(v._id)).map(toEventVenue);
    setOptions(uniqBy([...userVenues, ...venues], (v) => v._id));
  }, [EJSON.stringify([user, venueIds, allVenues] as any)]);

  if (isLoadingAllVenues()) {
    return null;
  }

  return (
    <AsyncTypeahead
      id="edit-venue-typeahead"
      defaultSelected={value ? [value as any] : ([{}] as any)}
      filterBy={() => true}
      isLoading={isLoading}
      labelKey={(option) => {
        const venue = option as VenueEntity;
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
        const { isInvalid, isValid, size } = props as unknown as {
          // From https://github.com/ericgio/react-bootstrap-typeahead/blob/main/src/components/Typeahead/Typeahead.tsx#L101
          isInvalid: boolean;
          isValid: boolean;
          // From https://github.com/ericgio/react-bootstrap-typeahead/blob/main/src/constants.ts#L3
          size: "lg" | "sm";
        };
        const commonProps = { ...inputProps, id, isInvalid, isValid, size, className };

        // Add type="search" to have a clear button
        return <TypeaheadInputSingle {...commonProps} type="search" autoFocus={autofocus} />;
      }}
      renderMenu={(results, menuProps, state) => (
        <CustomMenu
          region={region}
          results={results as (EventVenue | EventVenueRef)[]}
          menuProps={menuProps}
          text={state.text}
        />
      )}
      onChange={(newValue) => onChange(newValue[0] as EventVenue | EventVenueRef | undefined)}
      onBlur={onBlur}
    />
  );
}
