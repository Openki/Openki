import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { geoLocationLink } from "/imports/utils/geoLocationLink";
import { format } from "/imports/utils/location-format";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import * as VenuesMethods from "/imports/api/venues/methods";
import { VenueModel } from "/imports/api/venues/venues";

import { ButtonDelete, ButtonEdit } from "../../Buttons";
import { Contribution } from "../../Contribution";
import {
  type Props as DeleteConfirmDialogProps,
  DeleteConfirmDialog,
} from "../../delete-confirm-dialog";
import { Display as LocationDisplay } from "../../location/display";
import { ProfileLink } from "../../profile-link";
import { EditOrganization } from "./edit-organization";
import { PastEvents } from "./PastEvents";
import { UpcomingEvents } from "./UpcomingEvents";

import "./styles.scss";

export function Display({ venue, onEdit }: { venue: VenueModel; onEdit: () => void }) {
  const { t } = useTranslation();
  const user = useUser();

  const [verifyDelete, setVerifyDelete] = useState(false);

  function facilityNames() {
    return Object.keys(venue.facilities);
  }

  function deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    return {
      confirmText: t(
        "venue.reallyDelete",
        "Please confirm that you would like to delete this venue. This cannot be undone.",
      ),
      confirmButton: t("venue.detail.remove", "Remove this venue"),
      busyButton: t("venue.detail.remove.busy", "Deleting venue…"),
      onCancel: async () => {
        setVerifyDelete(false);
      },
      onRemove: async () => {
        try {
          await VenuesMethods.remove(venue._id);

          Alert.success(t("venue.removed", 'Removed venue "{NAME}".', { NAME: venue.name }));
          Router.go("profile");
        } catch (err) {
          Alert.serverError(err, t("venue.removed.error", "Deleting the venue went wrong"));
        }
      },
    };
  }

  return (
    <>
      <div className="page-component">
        <div className="details-header location-details-header">
          <h3 data-test="venue-details-header">
            {venue.name} {!!venue.short && <small>{venue.short}</small>}
          </h3>
          <p dangerouslySetInnerHTML={{ __html: venue.description }}></p>
        </div>

        <div className="details-body location-details-body">
          <div className="details-content">
            <div className="row">
              <div className={venue.loc ? "col-md-7" : "col"}>
                {!!venue.address && (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.address", "Address:")}
                    </span>{" "}
                    {venue.address}
                  </p>
                )}
                {!!venue.route && (
                  <p>
                    <div className="venue-property-title">
                      {t("venue.details.route", "How to go there:")}
                    </div>
                    <span className="whitespace-pre-line">{venue.route}</span>
                  </p>
                )}
                {!!venue.maxPeople && (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.max_ppl", "Maximum People:")}
                    </span>{" "}
                    {venue.maxPeople}
                  </p>
                )}
                {!!venue.maxWorkplaces && (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.max_workplaces", "Maximum Workplaces:")}
                    </span>{" "}
                    {venue.maxWorkplaces}
                  </p>
                )}
                {facilityNames().length > 0 && (
                  <>
                    <span className="venue-property-title">
                      {t("venue.details.availableInfrastructure", "Available infrastructure:")}
                    </span>
                    <ul>
                      {facilityNames().map((facilityName) => (
                        <li key={facilityName}>{t(`venue.facility.${facilityName}`)}</li>
                      ))}
                    </ul>
                  </>
                )}
                {!!venue.otherFacilities && (
                  <p>
                    <div className="venue-property-title">
                      {t("venue.details.additionalEquipment", "Additional equipment:")}
                    </div>
                    {venue.otherFacilities}
                  </p>
                )}
                {(!!venue.editor || !!venue.editOrganization || venue.editableBy(user)) && (
                  <>
                    <span className="venue-property-title">
                      {t("location.details.hosts", "Hosts:")}
                    </span>
                    <ul>
                      {!!venue.editor && (
                        <li>
                          <ProfileLink userId={venue.editor} />
                          <Contribution userId={venue.editor} />
                        </li>
                      )}
                      {(!!venue.editOrganization || venue.editableBy(user)) && (
                        <li>
                          <EditOrganization venue={venue} />
                        </li>
                      )}
                    </ul>
                  </>
                )}

                <span className="venue-property-title">
                  {t("location.details.hints", "Hints:")}
                </span>
                <ul className="fa-ul">
                  <li>
                    {!venue.restrictedUse ? (
                      <>
                        <span className="fa-li">
                          <i className="fa-solid fa-check" />
                        </span>
                        {t(
                          "venue.details.notRestrictedUse.description",
                          "This venue can chosen by everyone to publish an event. Still users are reminded to first contact its hosts to check for available time slot.",
                        )}
                      </>
                    ) : (
                      <>
                        <span className="fa-li">
                          <i className="fa-solid fa-xmark" />
                        </span>
                        {t(
                          "venue.details.restrictedUse.description",
                          "This venue can only be chosen by its hosts to publish an event.",
                        )}
                      </>
                    )}
                  </li>
                  <li>
                    {venue.allowParallelEvents ? (
                      <>
                        <span className="fa-li">
                          <i className="fa-solid fa-check" />
                        </span>
                        {t(
                          "venue.details.allowParallelEvents.description",
                          "Overlapping events are allowed in this venue.",
                        )}
                      </>
                    ) : (
                      <>
                        <span className="fa-li">
                          <i className="fa-solid fa-xmark" />
                        </span>
                        {t(
                          "venue.details.notAllowParallelEvents.description",
                          "This venue does not allow overlapping events.",
                        )}
                      </>
                    )}
                  </li>

                  {venue.editableBy(user) && (
                    <li>
                      {venue.bookingIcal ? (
                        <>
                          <span className="fa-li">
                            <i className="fa-solid fa-check" />
                          </span>
                          {t(
                            "venue.details.bookingIcal.isSet",
                            "A link to existing bookings is given.",
                          )}
                        </>
                      ) : (
                        <>
                          <span className="fa-li">
                            <i className="fa-solid fa-xmark" />
                          </span>
                          {t(
                            "venue.details.bookingIcal.isNotSet",
                            "No link to exisitng booking is known. Add a iCalendar link to show other users when your venue is booked or free.",
                          )}
                        </>
                      )}
                    </li>
                  )}
                </ul>
              </div>
              {!!venue.loc && !!venue.region && (
                <div className="col-md-5">
                  <div className="details-map">
                    <LocationDisplay
                      region={venue.region}
                      coordinates={venue.loc.coordinates}
                      level={venue.level}
                    />
                    <div className="coordinates">
                      <a href={geoLocationLink(venue.loc)}>
                        {t("venueDetails.coordinates", "Coordinates:")} {format(t, venue.loc)}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {venue.editableBy(user) && (
          <>
            <div className="actions">
              <ButtonEdit
                id="venues-display-edit"
                onClick={() => {
                  onEdit();
                  setVerifyDelete(false);
                }}
              />
              {!verifyDelete && (
                <ButtonDelete
                  id="venues-display-confirmDelete"
                  onClick={async () => setVerifyDelete(true)}
                />
              )}
            </div>
            {verifyDelete && <DeleteConfirmDialog {...deleteConfirmDialogAttr()} />}
          </>
        )}
      </div>
      <UpcomingEvents venue={venue._id} />
      <PastEvents venue={venue._id} />
    </>
  );
}
