import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";

import * as Alert from "/imports/api/alerts/alert";
import { Geodata } from "/imports/api/Geodata";
import { useFindFilter } from "/imports/api/regions/publications";
import * as VenuesMethods from "/imports/api/venues/methods";
import { FacilityOption, VenueModel } from "/imports/api/venues/venues";

import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { Edit as LocationEdit } from "../../location/edit";
import { AdditionalInfo, type Data as AdditionalInfoData } from "./additional-info";
import { Richtext } from "/imports/ui/components/richtext";

import "./styles.scss";

export interface Props {
  venue: VenueModel;
  onSaved: () => void;
  onCanceled: () => void;
}

export function Edit({ venue, onSaved, onCanceled }: Props) {
  const { t } = useTranslation();

  const sessionRegion = useCurrentRegionId();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const isNew = !venue._id;

  const [changes, setChanges] = useState({
    name: venue.name,
    description: venue.description,
    address: venue.address,
    route: venue.route,
    short: venue.short,
    maxPeople: venue.maxPeople,
    maxWorkplaces: venue.maxWorkplaces,
    facilities: Object.entries(venue.facilities)
      .filter((f) => f[1])
      .map((f) => f[0] as FacilityOption),
    otherFacilities: venue.otherFacilities,
    restrictedUse: venue.restrictedUse,
    allowParallelEvents: venue.allowParallelEvents,
    selectedRegion: isNew ? sessionRegion : venue.region,
    loc: venue.loc as Geodata | undefined,
    level: venue.level,
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
    return regionSelectable() || !!changes.selectedRegion;
  }

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
    if (changes.level !== undefined) {
      changes1.level = changes.level;
    }
    if (changes.restrictedUse !== undefined) {
      changes1.restrictedUse = changes.restrictedUse;
    }
    if (changes.allowParallelEvents !== undefined) {
      changes1.allowParallelEvents = changes.allowParallelEvents;
    }
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

    const loc = changes.loc;
    if (loc) {
      changes1.loc = loc;
    } else {
      Alert.error(t("venue.create.plsSelectPointOnMap", "Please select a point on the map"));
      return;
    }

    const venueId = venue?._id || "";
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
          regions.find((r) => r._id === changes1.region)?.nameEn,
        );

        Router.go("venueDetails", { _id: res });
      } else {
        onSaved();
      }
    } catch (err) {
      Alert.serverError(err, t("venue.saving.error", "Could not save the venue"));
    }
  };

  const handleCancel = () => {
    if (isNew) {
      Router.go("home");
    } else {
      onCanceled();
    }
  };

  const selectedRegion = regions.find((r) => r._id === changes.selectedRegion);
  const mapCenter = selectedRegion?.map?.center.coordinates || selectedRegion?.loc?.coordinates;

  return (
    <div className="edit-page venue-edit">
      {venue._id ? (
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
        {showMapSelection() && (
          <div className="row gap-3 mb-3">
            {regionSelectable() && (
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
                        <option key={region._id} value={region._id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select className="form-select placeholder-glow" />
                  )}
                </div>
              </div>
            )}
            {!!(changes.selectedRegion && mapCenter) && (
              <div className="col-md">
                <label className="form-label">
                  {t(
                    "venue.edit.map",
                    'Please add location by clicking "+" (on the right inside the map)',
                  )}
                </label>
                <LocationEdit
                  region={changes.selectedRegion}
                  center={mapCenter}
                  coordinates={changes.loc?.coordinates}
                  level={changes.level}
                  onChange={(newValue) => {
                    setChanges((prevState) => ({
                      ...prevState,
                      loc: newValue?.coordinates
                        ? {
                            coordinates: newValue.coordinates,
                            type: "Point",
                          }
                        : undefined,
                      level: newValue?.level,
                    }));
                  }}
                />
              </div>
            )}
          </div>
        )}

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
          <label className="form-label">{t("venue.edit.restrictedUse", "Restricted use")}</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="eventRestrictedUseCheck"
              checked={changes.restrictedUse}
              onChange={(ev) => {
                const restrictedUse = ev.currentTarget.checked;
                setChanges((prevState) => ({
                  ...prevState,
                  restrictedUse,
                }));
              }}
            />
            <label className="form-check-label" htmlFor="eventRestrictedUseCheck">
              {t(
                "venue.edit.restrictedUse.label",
                "This venue can only be chosen by its hosts to publish an event.",
              )}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="eventAllowParallelEvents"
              checked={changes.allowParallelEvents}
              onChange={(ev) => {
                const allowParallelEvents = ev.currentTarget.checked;
                setChanges((prevState) => ({
                  ...prevState,
                  allowParallelEvents,
                }));
              }}
            />
            <label className="form-check-label" htmlFor="eventAllowParallelEvents">
              {t("venue.edit.allowParallelEvents.label", "Allow overlapping events in this venue")}
            </label>
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
          <ButtonSave onClick={handleSave} />
          <ButtonCancel onClick={handleCancel} />
        </div>
      </form>
    </div>
  );
}
