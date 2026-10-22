import { Router } from "meteor/iron:router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegionId } from "/imports/ui/hooks/useCurrentRegion";

import * as Alert from "/imports/api/alerts/alert";
import { Geodata } from "/imports/api/Geodata";
import { useAll as useRegions } from "/imports/api/regions/publications";
import * as VenuesMethods from "/imports/api/venues/methods";
import { FacilityOption, VenueModel } from "/imports/api/venues/venues";

import * as Analytics from "/imports/ui/lib/analytics";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { FormControl } from "../../form-control";
import { FormCheck } from "../../FormCheck";
import { AdditionalInfo, type Props as AdditionalInfoData } from "./additional-info";
import { RegionSelect } from "/imports/ui/components/RegionSelect";

import "./styles.scss";
import { useAccountTasks } from "/imports/ui/hooks/useAccountTasks";
import { useValidation } from "/imports/ui/hooks/useValidation";
import { FormMap } from "/imports/ui/components/location/FormMap";

export interface Props {
  venue: VenueModel;
  onSaved: () => void;
  onCanceled: () => void;
}

export function Edit({ venue, onSaved, onCanceled }: Props) {
  const isNew = !venue._id;
  const { t } = useTranslation();

  const currentRegion = useCurrentRegionId();
  const [isRegionsLoading, regions] = useRegions();

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const { promptToLogin } = useAccountTasks();

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
    bookingIcal: venue.bookingIcal,
    selectedRegion: venue.region,
    loc: venue.loc as Geodata | undefined,
    level: venue.level,
  });
  // init selected region
  useEffect(() => {
    if (!isNew) {
      // only needed for new venues
      return;
    }

    if (currentRegion) {
      //  If the session sets the region, we use it.
      setChanges((prevState) => ({ ...prevState, selectedRegion: currentRegion }));
    } else if (regions.length === 1) {
      // There is only one region
      setChanges((prevState) => ({ ...prevState, selectedRegion: regions[0]._id }));
    }
  }, [currentRegion, regions]);

  const [errors, checkValidity, addError] = useValidation(
    {
      noName: {
        field: "name",
        isValid: () => !!changes.name,
        text: () => t("venue.create.plsGiveVenueName", "Please give your venue a name"),
      },
      noDescription: {
        field: "description",
        isValid: () => !!changes.description,
        text: () =>
          t("venue.create.plsProvideDescription", "Please provide a description for your venue"),
      },
      noRegion: {
        field: "region",
        isValid: () => !!changes.selectedRegion,
        text: () => t("venue.create.plsSelectRegion", "Please select a region"),
      },
      noLocation: {
        field: "location",
        isValid: () => !!changes.loc,
        text: () => t("venue.create.plsSelectPointOnMap", "Please select a point on the map"),
      },
    },
    { autoCheckFixed: true },
  );

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
  function showRegionSelection() {
    return (
      // You can select the region for venues that are new
      isNew &&
      // and the session not sets the region
      !currentRegion &&
      // and when more then one region exists
      regions.length > 1
    );
  }
  function showMapSelection() {
    return showRegionSelection() || !!changes.selectedRegion;
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
      return;
    }

    const changes1: VenuesMethods.SaveFields = {
      name: changes.name,
      description: changes.description,
      address: changes.address,
      route: changes.route,
      short: changes.short,
      maxPeople: changes.maxPeople,
      maxWorkplaces: changes.maxWorkplaces,
      facilities: changes.facilities,
    };
    if (changes.otherFacilities !== undefined) {
      changes1.otherFacilities = changes.otherFacilities;
    }
    if (changes.level !== undefined) {
      changes1.level = changes.level;
    } else {
      if (isNew && changes.selectedRegion) {
        const region = regions.find((r) => r._id === changes.selectedRegion);
        if (region?.map?.defaultLevel !== undefined) {
          changes1.level = region.map.defaultLevel;
        }
      }
    }

    if (isNew) {
      if (changes.restrictedUse !== undefined) {
        changes1.restrictedUse = changes.restrictedUse;
      } else {
        // default for new venues is that they can be used by everyone
        changes1.restrictedUse = false;
      }
    } else if (changes.restrictedUse !== undefined) {
      changes1.restrictedUse = changes.restrictedUse;
    }
    if (changes.allowParallelEvents !== undefined) {
      changes1.allowParallelEvents = changes.allowParallelEvents;
    }
    if (changes.bookingIcal !== undefined) {
      changes1.bookingIcal = changes.bookingIcal;
    }

    if (isNew) {
      if (!changes.selectedRegion) {
        throw new Error("Unexpected falsy: changes.selectedRegion");
      }
      changes1.region = changes.selectedRegion;
    }

    if (!changes.loc) {
      throw new Error("Unexpected falsy: changes.loc");
    }
    changes1.loc = changes.loc;

    setIsBusy(true);
    try {
      if (!(await promptToLogin())) {
        return;
      }
      const venueId = await VenuesMethods.save(venue?._id || "", changes1);

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

        Router.go("venueDetails", { _id: venueId });
      } else {
        onSaved();
      }
    } catch (err) {
      if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
        // unknown error
        Alert.serverError(err, t("venue.saving.error", "Could not save the venue"));
      }
    } finally {
      setIsBusy(false);
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
  const mapCenter = selectedRegion?.map?.center?.coordinates || selectedRegion?.loc?.coordinates;

  if (isRegionsLoading()) {
    return null;
  }

  return (
    <div className="edit-page venue-edit">
      {venue._id ? (
        <h2>{t("venue.edit.title", "Edit venue")}</h2>
      ) : (
        <h2>{t("venue.edit.titleCreate", "Create new venue")}</h2>
      )}
      <form noValidate onSubmit={handleSubmit}>
        <div className="mb-3">
          <FormControl
            id="venue-edit-name"
            type="text"
            label={t("venue.edit.name", "Name")}
            placeholder={t("venue.edit.namePlaceholder", "Full name of venue")}
            value={changes.name}
            onChange={(value) => setChanges((prevState) => ({ ...prevState, name: value }))}
            onBlur={() => checkValidity("name")}
            error={errors.name}
          />
        </div>
        <div className="mb-3">
          <FormControl
            id="venue-edit-description"
            type="richtext"
            label={t("venue.edit.description", "Description")}
            value={changes.description}
            placeholder={t("venue.edit.description.placeholder", "Some words about this venue")}
            onChange={(value) => setChanges((prevState) => ({ ...prevState, description: value }))}
            onBlur={() => checkValidity("description")}
            error={errors.description}
          />
        </div>
        {showMapSelection() && (
          <div className="row gap-3 mb-3">
            {showRegionSelection() && (
              <div className="col-md">
                <RegionSelect
                  id="venue-edit-region"
                  value={changes.selectedRegion}
                  onChange={(value) =>
                    setChanges((prevState) => ({ ...prevState, selectedRegion: value }))
                  }
                  onBlur={() => checkValidity("region")}
                  error={errors.region}
                />
              </div>
            )}
            {!!(changes.selectedRegion && mapCenter) && (
              <div className="col-md">
                <FormMap
                  id="venue-edit-location"
                  label={t(
                    "venue.edit.map",
                    'Please add location by clicking "+" (on the right inside the map)',
                  )}
                  region={changes.selectedRegion}
                  center={mapCenter}
                  value={changes.loc?.coordinates}
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
                  onBlur={() => checkValidity("location")}
                  error={errors.location}
                />
              </div>
            )}
          </div>
        )}

        <div className="mb-3">
          <FormControl
            id="venue-edit-address"
            type="text"
            label={t("venue.edit.address", "Address")}
            optional
            prepend="fa-solid fa-location-dot fa-fw"
            placeholder={t("venue.edit.address.placeholder", "Street, City, State")}
            value={changes.address}
            onChange={(value) => setChanges((prevState) => ({ ...prevState, address: value }))}
          />
        </div>

        <div className="mb-3">
          <FormControl
            id="editform-address"
            type="textarea"
            rows={3}
            label={t("venue.details.route")}
            optional
            prepend="fa-solid fa-signs-post"
            placeholder={t(
              "venue.route.placeholder",
              "near busstop, cross fence, then backyard, enter the black door… 23rd floor, then left.",
            )}
            value={changes.route}
            onChange={(value) => setChanges((prevState) => ({ ...prevState, route: value }))}
          />
        </div>

        <div className="mb-3">
          <FormCheck
            id="venue-edit-restrictedUse"
            type="box"
            label={t("venue.edit.restrictedUse", "Can be used by everyone")}
            additionalInformation={t(
              "venue.edit.restrictedUse.label",
              "Define, whether this venue can chosen by everyone to publish events, or just by it's hosts. Still users are reminded to first contact its hosts to check for available time slot.",
            )}
            checked={!changes.restrictedUse}
            onChange={(checked) =>
              setChanges((prevState) => ({
                ...prevState,
                restrictedUse: !checked,
              }))
            }
          />
          <FormCheck
            id="venue-edit-allowParallelEvents"
            type="box"
            label={t("venue.edit.allowParallelEvents.label", "Allow overlapping events")}
            checked={changes.allowParallelEvents}
            onChange={(checked) =>
              setChanges((prevState) => ({ ...prevState, allowParallelEvents: checked }))
            }
          />
        </div>
        <div className="mb-3">
          <FormControl
            id="venue.edit.bookingIcalUrl"
            type="url"
            label={t("venue.edit.bookingIcalUrl.label", "iCalendar url for existings bookings")}
            optional
            placeholder={t("venue.edit.bookingIcalUrl.placeholder", "https://....ics")}
            value={changes.bookingIcal || ""}
            onChange={(value) => setChanges((prevState) => ({ ...prevState, bookingIcal: value }))}
          />
        </div>
        <div className="mb-3">
          <div className="form-label">
            {t(
              "venue.edit.additionalInfo",
              "Additional info (optional, but helps others find the venue)",
            )}
          </div>
          {showAdditionalInfo ? (
            <button
              type="button"
              className="btn btn-cancel btn-block"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
            >
              {t("venue.edit.hideAdditionalInfo", "Hide additional info")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
            >
              {t("venue.edit.provideAdditionalInfo", "Fill out additional info")}
            </button>
          )}

          <div {...displayAdditionalInfo()}>
            <AdditionalInfo {...additionalInfoAttr()} />
          </div>
        </div>
        <div className="form-actions">
          <ButtonSave submit id="venues-edit-save" isBusy={isBusy} />
          <ButtonCancel id="venues-edit-cancel" onClick={handleCancel} disabled={isBusy} />
        </div>
      </form>
    </div>
  );
}
