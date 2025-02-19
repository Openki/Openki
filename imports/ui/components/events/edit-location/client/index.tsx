import React, { useState } from "react";
// import { Router } from "meteor/iron:router";
// import { _ } from "meteor/underscore";
import { map } from "lodash";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventVenueEntity } from "/imports/api/events/events";
import { useDetails } from "/imports/api/regions/publications";
// import * as Alert from "/imports/api/alerts/alert";
// import { FindFilter, Venues } from "/imports/api/venues/venues";
// import { UserModel, Users } from "/imports/api/users/users";

import { AsyncTypeahead } from "react-bootstrap-typeahead";

import "./styles.scss";

// const Template = TemplateAny as TemplateStaticTyped<
//   "eventEditVenue",
//   unknown,
//   {
//     locationTracker: LocationTracker;
//     location: ReactiveVar<Partial<EventVenueEntity>>;
//     name: ReactiveVar<string | undefined>; // Only required to fix a problem. See: #1347
//     search: ReactiveVar<string>;
//     addressSearch: ReactiveVar<boolean>;
//     venueEditor: ReactiveVar<UserModel | false | undefined>;
//     locationIs: (type: "unset" | "preset" | "own") => boolean;
//     reset: () => void;
//   }
// >;

// const template = Template.eventEditVenue;

// template.onCreated(function () {
//   const instance = this;
//   // Something, somewhere, must have gone terribly wrong (for this line to exist)
//   const parent = instance.parentInstance() as any;

//   instance.locationTracker = new LocationTracker();
//   instance.location = parent.selectedLocation;
//   instance.name = new ReactiveVar(instance.location.get().name);
//   instance.search = new ReactiveVar("");
//   instance.addressSearch = new ReactiveVar(Boolean(instance.location.get().name));

//   // unset: no location selected
//   // preset: one of the preset locations is referenced
//   // own: name and coordinates were entered for this event specifically
//   instance.locationIs = function (type) {
//     const location = instance.location.get();
//     if (!location) {
//       return type === "unset";
//     }
//     if (location._id) {
//       return type === "preset";
//     }
//     if (location.name || location.loc) {
//       return type === "own";
//     }
//     return type === "unset";
//   };

//   instance.autorun(() => {
//     const draggable = !instance.locationIs("preset");
//     instance.locationTracker.setLocation(instance.location.get(), draggable, draggable);
//   });

//   instance.autorun(() => {
//     const regionId = parent.selectedRegion.get();
//     instance.locationTracker.setRegion(regionId);
//   });

//   instance.reset = function () {
//     instance.locationTracker.markers.remove({ proposed: true });
//   };

//   instance.autorun(() => {
//     // Set proposed location as new location when it is selected
//     instance.locationTracker.markers.find({ proposed: true, selected: true }).observe({
//       added(mark: ProposedMarkerEntity & SelectedMarkerEntity) {
//         // When a propsed marker is selected, we clear the other location proposals and
//         // store it as new location for the event
//         const updLocation = instance.location.get();
//         updLocation.loc = mark.loc;
//         if (mark.presetName) {
//           updLocation.name = mark.presetName;
//         }
//         if (mark.presetAddress) {
//           updLocation.address = mark.presetAddress;
//         }
//         if (mark.preset) {
//           updLocation._id = mark._id;
//           updLocation.editor = mark.editor;
//           updLocation.name = mark.presetName;
//           updLocation.address = mark.presetAddress;
//         }
//         instance.locationTracker.markers.remove({ main: true });

//         instance.name.set(updLocation.name);
//         instance.location.set(updLocation);
//         instance.addressSearch.set(true); // Ugly hack to banish location proposals
//         instance.locationTracker.markers.remove({ proposed: true });
//       },
//     });

//     // Update position if marker was dragged
//     instance.locationTracker.markers.find({ main: true }).observe({
//       changed(mark: MainMarkerEntity | RemoveMarkerEntity) {
//         const updLocation = instance.location.get();
//         if ("remove" in mark && mark.remove) {
//           delete updLocation.loc;
//         } else {
//           if (_.isEqual(mark.loc, updLocation.loc)) {
//             return;
//           }
//           updLocation.loc = mark.loc;
//         }
//         instance.location.set(updLocation);
//       },
//     });
//   });

//   instance.autorun(() => {
//     // Do not search preset locations when one is already chosen or when
//     // searching address
//     if (instance.locationIs("preset") || instance.addressSearch.get()) {
//       return;
//     }

//     const search = instance.search.get().trim();
//     instance.locationTracker.markers.remove({ proposed: true });

//     const query: FindFilter = { region: parent.selectedRegion.get() };

//     if (search.length > 0) {
//       query.search = search;
//     } else {
//       query.recent = true;
//     }
//     // We dont have recent events loaded on the client
//     const localQuery = _.extend({}, query, { recent: false });

//     instance.subscribe("Venues.findFilter", query, 10);
//     Venues.findFilter(localQuery).observe({
//       added(originalLocation) {
//         const location: ProposedMarkerEntity = {
//           ...originalLocation,
//           proposed: true,
//           preset: true,
//           presetName: originalLocation.name,
//           presetAddress: originalLocation.address,
//         };
//         instance.locationTracker.markers.insert(location);
//       },
//     });
//   });

//   this.venueEditor = new ReactiveVar(false);
//   this.autorun(() => {
//     const venueEditor = this.location.get().editor;
//     if (venueEditor) {
//       this.subscribe("user", venueEditor, () => {
//         this.venueEditor.set(Users.findOne(venueEditor));
//       });
//     }
//   });
// });

// template.helpers({
//   location() {
//     return Template.instance().location.get();
//   },

//   haveLocationCandidates() {
//     return Template.instance().locationTracker.markers.find({ proposed: true }).count() > 0;
//   },

//   locationCandidates() {
//     return Template.instance().locationTracker.markers.find({ proposed: true });
//   },

//   locationIsPreset() {
//     return Template.instance().locationIs("preset");
//   },

//   hostProfileLink() {
//     return Router.url("userprofile", Template.instance().venueEditor.get() as any);
//   },

//   eventMarkers() {
//     return Template.instance().locationTracker.markers;
//   },

//   allowPlacing() {
//     const { location } = Template.instance();

//     // We return a function so the reactive dependency on locationState is
//     // established from within the map template which will call it. The
//     // craziness is strong with this one.
//     return () => !location.get().loc;
//   },

//   allowRemoving() {
//     const { locationIs, location } = Template.instance();

//     return () => locationIs("own") && !!location.get().loc;
//   },

//   hoverClass() {
//     return this.hover ? "hover" : "";
//   },

//   searching() {
//     return !!Template.instance().location.get().name;
//   },
// });

// template.events({
//   async "click .js-location-search-btn"(event, instance) {
//     event.preventDefault();

//     instance.addressSearch.set(true);
//     const search = instance.$(".js-location-search-input").val();
//     const nominatimQuery: Record<string, any> = {
//       format: "json",
//       q: search,
//       limit: 10,
//     };

//     const { markers } = instance.locationTracker;

//     const region = markers.findOne({ center: true }) as CenteredMarkerEntity;
//     if (region?.loc) {
//       nominatimQuery.viewbox = [
//         region.loc.coordinates[0] - 0.1,
//         region.loc.coordinates[1] + 0.1,
//         region.loc.coordinates[0] + 0.1,
//         region.loc.coordinates[1] - 0.1,
//       ].join(",");
//       nominatimQuery.bounded = 1;
//     }

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org?${new URLSearchParams(nominatimQuery)}`,
//       );
//       const found = await response.json();
//       markers.remove({ proposed: true });
//       if (found.length === 0) {
//         Alert.warning(
//           i18n("event.edit.noResultsforAddress", 'Found no results for the address "{ADDRESS}"', {
//             ADDRESS: search,
//           }),
//         );
//       }
//       _.each(found, (foundLocation) => {
//         const marker = {
//           loc: {
//             type: "Point",
//             coordinates: [
//               Number.parseFloat(foundLocation.lon),
//               Number.parseFloat(foundLocation.lat),
//             ],
//           },
//           proposed: true,
//           presetAddress: foundLocation.display_name.replace(
//             /[^\d]*(\d+), ([^,]+),.*, ([^,]+), (\d+), [^,]+/,
//             "$2 $1, $4 $3",
//           ),
//           name: foundLocation.display_name.replace(
//             /[^\d]*(\d+), ([^,]+),.*, ([^,]+), (\d+), [^,]+/,
//             "$2 $1, $4 $3",
//           ),
//         } as ProposedMarkerEntity;
//         instance.locationTracker.markers.insert(marker);
//       });
//     } catch (reason) {
//       Alert.serverError(reason);
//     }
//   },

//   "click .js-location-change"(_event, instance) {
//     instance.addressSearch.set(false);
//     instance.name.set("");
//     instance.location.set({});
//     instance.search.set("");
//   },

//   "click .js-location-candidate"(this: MarkerEntity, _event, instance) {
//     instance.locationTracker.markers.update(this._id, { $set: { selected: true } });
//   },

//   "keyup .js-location-search-input"(event, instance) {
//     const updLocation = instance.location.get();
//     const name = (event.target as HTMLInputElement).value;
//     updLocation.name = name;
//     instance.name.set(name);
//     instance.location.set(updLocation);

//     setTimeout(() => {
//       instance.addressSearch.set(false);
//       instance.search.set((event.target as HTMLInputElement).value);
//     });
//   },

//   "keyup .js-location-address-search"(event, instance) {
//     const updLocation = instance.location.get();
//     updLocation.address = (event.target as HTMLInputElement).value;
//     instance.location.set(updLocation);
//   },

//   "mouseenter .js-location-candidate"(this: MarkerEntity, _event, instance) {
//     instance.locationTracker.markers.update({}, { $set: { hover: false } }, { multi: true });
//     instance.locationTracker.markers.update(this._id, { $set: { hover: true } });
//   },

//   "mouseleave .js-location-candidate"(_event, instance) {
//     instance.locationTracker.markers.update({}, { $set: { hover: false } }, { multi: true });
//   },
// });

export function EditVenue({
  region: regionId,
  value,
  onChange,
}: {
  region: string;
  value: EventVenueEntity | undefined;
  onChange: (newValue: EventVenueEntity) => void;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<EventVenueEntity[]>([]);

  const [isRegionLoading, region] = useDetails(regionId);

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org?${new URLSearchParams(nominatimQuery)}`,
      );
      const found = await response.json();
      setOptions(
        map(found, (foundLocation) => {
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
      );
    } catch (reason) {
      Alert.serverError(reason);
    }
    setIsLoading(false);
  };

  if (isRegionLoading()) {
    return null;
  }

  return (
    <>
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
          minLength={3}
          onSearch={handleSearch}
          options={options}
          placeholder={t("event.edit.locationNamePlaceholder", "Address or name of venue") || ""}
          renderMenuItemChildren={(option) => {
            const venue = option as EventVenueEntity;
            return (
              <>
                {[!!venue.name && <strong>{venue.name}</strong>, venue.address]
                  .filter((v) => v)
                  .reduce((prev, curr) => [prev, <>, </>, curr] as any)}
              </>
            );
          }}
          onChange={(newValue) => {
            onChange(newValue[0] as EventVenueEntity);
          }}
        />
      </div>
      {!!value && (
        <div className="mb-3">
          <label className="form-label">
            {t("course.event.edit.locationName", "Anzeigen als")}
          </label>
          <input type="text" className="form-control" value={value.name} />
        </div>
      )}
      {/* {{#if locationIsPreset}}
                  <div className="event-edit-location-selected">
                    <span className="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
                    {{> venueLink venue=location openInNewTab=true}}
                    {{#if location.address}}
                      <div className="event-edit-location-address">
                        {{location.address}}
                      </div>
                    {{/if}}
                    {{#if location.editor}}
                      <div className="event-edit-location-contact">
                        {{i18n 'event.editVenue.pleaseContactHost' 'Please contact the host of this venue to check for availability and other details:'}}
                        <a href="{{hostProfileLink}}" target="_blank">
                          <span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>
                          {{i18n 'event.editVenue.contactHost' 'Contact host'}}
                        </a>
                      </div>
                    {{/if}}
                  </div>
                  <button type="button" className="btn btn-edit js-location-change location-change-btn">
                    {{i18n 'event.edit.locationChange' "Change venue"}}
                  </button>
                {{else}}
                  <div className="input-group event-edit-location-searchbar">
                    <input type="text" className="form-control js-location-search-input"
                          placeholder="{{i18n 'event.edit.locationNamePlaceholder' 'Address or name of venue' attr=true}}"
                          value="{{name}}" />
                    <button type="submit" className="btn btn-go js-location-search-btn">
                      {{i18n 'event.edit.addressSearch' "Search"}}
                    </button>
                  </div>
                  {{#if searching}}
                    <input type="text" className="form-control js-location-address-search"
                          placeholder="{{i18n 'event.edit.locationAddressPlaceholder' 'Address' attr=true}}"
                          size="40" value="{{location.address}}" />
                  {{/if}}
                  {{#if haveLocationCandidates}}
                    {{#if searching}}
                      {{i18n 'event.edit.locations.proposed' 'Matching locations:'}}
                    {{else}}
                      {{i18n 'event.edit.locations.previouslyUsed' 'Recently used locations:'}}
                    {{/if}}
                    <ul className="event-edit-location-candidates">
                      {{#each locationCandidates}}
                        <li className='event-edit-location-candidate js-location-candidate {{hoverClass}}'>
                          {{name}}
                          <div className="address">{{address}}</div>
                        </li>
                      {{/each}}
                    </ul>
                  {{else}}
                    <p>
                      {{i18n 'event.edit.locations.foundnone' 'No locations found.'}}
                    </p>
                    <p>
                      {{i18n 'profile.createNewVenue.question' 'Are you responsible for this venue?'}}
                      <a href="{{pathFor 'venueDetails' _id='create'}}"
                        target="_blank">{{i18n 'profile.createNewVenue.linkText' 'Set up a venue that is visible to others and can be reused.'}}</a>
                    </p>
                  {{/if}}
                {{/if}} */}
      {/* <div className="col-md-5 event-edit-location-map">
                {{> map markers=eventMarkers allowPlacing=allowPlacing allowRemoving=allowRemoving}}
              </div> */}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventEditVenue", () => EditVenue);
