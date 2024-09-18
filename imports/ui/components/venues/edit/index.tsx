import { Mongo } from "meteor/mongo";
import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";

import * as Alert from "/imports/api/alerts/alert";
import { Regions } from "/imports/api/regions/regions";
import { FacilityOption, VenueModel } from "/imports/api/venues/venues";
import * as VenuesMethods from "/imports/api/venues/methods";
import { useFindFilter } from "/imports/api/regions/publications";

import { LocationTracker, MarkerEntity } from "/imports/ui/lib/location-tracker";
import * as Analytics from "/imports/ui/lib/analytics";
import { Location } from "../../location";

import { AdditionalInfo, type Data as AdditionalInfoData } from "./additional-info";
import { Richtext } from "/imports/ui/components/richtext";
import { ButtonCancel, ButtonSave } from "/imports/ui/components/buttons";

import "./styles.scss";

export function Edit({
  data,
  onSaved,
  onCanceled,
}: {
  data: VenueModel;
  onSaved: () => void;
  onCanceled: () => void;
}) {
  const { t } = useTranslation();

  const sessionRegion = useCurrentRegionId();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const isNew = !data._id;

  const locationTracker = new LocationTracker();
  locationTracker.setLocation(data, true);

  const [isBusy, setIsBusy] = useState(false);

  const [changes, setChanges] = useState({
    name: data.name,
    description: data.description,
    address: data.address,
    route: data.route,
    short: data.short,
    maxPeople: data.maxPeople,
    maxWorkplaces: data.maxWorkplaces,
    facilities: Object.entries(data.facilities)
      .filter((f) => f[1])
      .map((f) => f[0] as FacilityOption),
    otherFacilities: data.otherFacilities,
    selectedRegion: isNew ? sessionRegion : data.region,
  });

  const [isLoading, regions] = useFindFilter();

  function displayAdditionalInfo() {
    return {
      style: { display: showAdditionalInfo ? "block" : "none" },
    };
  }

  function additionalInfoAttr(): AdditionalInfoData {
    return {
      data: changes,
      onShortChange: (newValue) => {
        setChanges((prevState) => ({ ...prevState, short: newValue }));
      },
      onMaxPeopleChange: (newValue) => {
        setChanges((prevState) => ({ ...prevState, maxPeople: newValue }));
      },
      onMaxWorkplacesChange: (newValue) => {
        setChanges((prevState) => ({ ...prevState, maxWorkplaces: newValue }));
      },
      onFacilitiesChange: (newValue) => {
        setChanges((prevState) => ({ ...prevState, facilities: newValue }));
      },
      onOtherFacilitiesChange: (newValue) => {
        setChanges((prevState) => ({ ...prevState, otherFacilities: newValue }));
      },
    };
  }
  function regionSelectable() {
    if (isNew) {
      // If the session sets the region, we use it.
      // If the session does not give us a region, we let the user select it
      return !sessionRegion;
    }

    // For existing venues the region is already selected and cannot
    // be changed
    return false;
  }
  function showMapSelection() {
    return regionSelectable || !!changes.selectedRegion;
  }
  function regionSelected() {
    return !!changes.selectedRegion;
  }
  // function venueMarkers() {
  //   return locationTracker.markers;
  // }
  // function allowPlacing() {
  //   // We return a function so the reactive dependency on locationState is
  //   // established from within the map template which will call it.
  //   return () =>
  //     // We only allow placing if we don't have a selected location yet
  //     !locationTracker.getLocation();
  // }
  // function allowRemoving() {
  //   return () => !!locationTracker.getLocation();
  // }

  useEffect(() => {
    if (!changes.selectedRegion) {
      return;
    }
    locationTracker.setRegion(changes.selectedRegion);
  });

  locationTracker.markers.find().observe({
    added(orginalLocation) {
      if ("proposed" in orginalLocation && orginalLocation.proposed) {
        // The map widget does not reactively update markers when their
        // flags change. So we remove the propsed marker it added and
        // replace it by a main one. This is only a little weird.
        locationTracker.markers.remove({ proposed: true });

        const location = {
          ...orginalLocation,
          main: true,
          draggable: true,
          proposed: undefined,
        } as Mongo.OptionalId<MarkerEntity>;
        locationTracker.markers.insert(location);
      }
    },

    changed(location) {
      if ("remove" in location && location.remove) {
        locationTracker.markers.remove(location._id);
      }
    },
  });

  const handleSave = async () => {
    const changes1: VenuesMethods.SaveFields = {
      name: changes.name,
      address: changes.address,
      route: changes.route,
      short: changes.short,
      maxPeople: changes.maxPeople,
      maxWorkplaces: changes.maxWorkplaces,
      facilities: changes.facilities,
    };
    if (changes.otherFacilities) {
      changes1.otherFacilities = changes.otherFacilities;
    }

    if (!changes1.name) {
      Alert.error(t("venue.create.plsGiveVenueName", "Please give your venue a name"));
      return;
    }

    const $description = $(".js-description");
    if (!$description.text()) {
      Alert.error(
        t("venue.create.plsProvideDescription", "Please provide a description for your venue"),
      );
      return;
    }

    changes1.description = $description.html();

    if (isNew) {
      const region = changes.selectedRegion;
      if (!region) {
        Alert.error(t("venue.create.plsSelectRegion", "Please select a region"));
        return;
      }
      changes1.region = region;
    }

    const loc = locationTracker.getLocation();
    if (loc) {
      changes1.loc = loc;
    } else {
      Alert.error(t("venue.create.plsSelectPointOnMap", "Please select a point on the map"));
      return;
    }

    const venueId = data._id || "";
    setIsBusy(true);
    try {
      const res = await VenuesMethods.save(venueId, changes1);

      Alert.success(
        t("venue.saving.success", 'Saved changes to venue "{NAME}".', {
          NAME: changes1.name,
        }),
      );

      if (isNew) {
        Analytics.trackEvent(
          "Venue creations",
          "Venue creations",
          Regions.findOne(changes1.region)?.nameEn,
        );

        Router.go("venueDetails", { _id: res });
      } else {
        onSaved();
      }
    } catch (err) {
      Alert.serverError(err, t("venue.saving.error", "Could not save the venue"));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      Router.go("/");
    } else {
      onCanceled();
    }
  };

  return (
    <div className="edit-page venue-edit">
      {data._id ? (
        <h2>{t("venue.edit.title", "Edit venue")}</h2>
      ) : (
        <h2>{t("venue.edit.titleCreate", "Create new venue")}</h2>
      )}
      <form>
        <div className="mb-3">
          <label className="form-label">{t("venue.edit.name", "Name")}</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder={t("venue.edit.namePlaceholder", "Full name of venue")}
            size={60}
            value={changes.name}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setChanges((prevState) => ({ ...prevState, name: value }));
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("venue.edit.description", "Description")}</label>
          <Richtext
            className="js-description"
            text={changes.description}
            placeholder={t("venue.edit.description.placeholder", "Some words about this venue")}
            onChange={(value) => {
              setChanges((prevState) => ({ ...prevState, description: value }));
            }}
          />
        </div>
        {showMapSelection() ? (
          <div className="row gap-3 mb-3">
            {regionSelectable() ? (
              <div className="col-md">
                <label className="form-label">{t("venue.edit.region", "Region")}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <span className="fa-solid fa-location-dot" aria-hidden="true"></span>
                  </span>
                  {!isLoading() ? (
                    <select
                      name="region"
                      className="form-select"
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setChanges((prevState) => ({ ...prevState, selectedRegion: value }));
                      }}
                    >
                      <option value="">{t("venue.edit.pls_select", "Please select")}</option>
                      {regions.map((region) => (
                        <option value={region._id}>{region.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select className="form-select placeholder-glow" />
                  )}
                </div>
              </div>
            ) : null}
            {regionSelected() ? (
              <div className="col-md">
                <label className="form-label">
                  {t(
                    "venue.edit.map",
                    'Please add location by clicking "+" (on the right inside the map)',
                  )}
                </label>
                <Location loc={data.loc} />
                {/* <Map markers={venueMarkers()} allowPlacing={allowPlacing()} allowRemoving={allowRemoving()}}} */}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-3">
          <label className="form-label">{t("venue.edit.address", "Address")}</label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
            </span>
            <input
              className="form-control"
              placeholder={t("venue.edit.address.placeholder", "Street, City, State")}
              value={changes.address}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setChanges((prevState) => ({ ...prevState, address: value }));
              }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="editform-address">
            {t("venue.details.route")}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-signs-post"></span>
            </span>
            <textarea
              className="form-control"
              id="editform-address"
              placeholder={t(
                "venue.route.placeholder",
                "near busstop, cross fence, then backyard, enter the black door… 23rd floor, then left.",
              )}
              value={changes.route}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setChanges((prevState) => ({ ...prevState, route: value }));
              }}
            ></textarea>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">
            {t(
              "venue.edit.additionalInfo",
              "Additional info (optional, but helps others find the venue)",
            )}
          </label>
          <br />
          {showAdditionalInfo ? (
            <button
              type="button"
              className="btn btn-cancel btn-block"
              onClick={() => {
                setShowAdditionalInfo(!showAdditionalInfo);
              }}
            >
              {t("venue.edit.hideAdditionalInfo", "Hide additional info")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                setShowAdditionalInfo(!showAdditionalInfo);
              }}
            >
              {t("venue.edit.provideAdditionalInfo", "Fill out additional info")}
            </button>
          )}

          <div {...displayAdditionalInfo()}>
            <AdditionalInfo {...additionalInfoAttr()} />
          </div>
        </div>
        <div className="form-actions">
          <ButtonSave disabled={isBusy} isBusy={isBusy} onClick={handleSave} />
          <ButtonCancel disabled={isBusy} onClick={handleCancel} />
        </div>
      </form>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("VenueEdit", () => Edit);
