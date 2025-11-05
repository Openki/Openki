import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { geoLocationLink } from "/imports/utils/geoLocationLink";
import { format } from "/imports/utils/location-format";
import { useUser } from "/imports/utils/react-meteor-data";

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
import { EditGroup } from "./edit-group";
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
        "venue.reallydelete",
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
                    <span className="pre-line">{venue.route}</span>
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
                {(!!venue.editor || !!venue.editGroup || venue.editableBy(user)) && (
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
                      {(!!venue.editGroup || venue.editableBy(user)) && (
                        <li>
                          <EditGroup venue={venue} />
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
                          "This venue can chosen by everyone to publish an event. But consider contacting its hosts about an available time slot.",
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
                          "This venue allow overlapping events.",
                        )}
                      </>
                    ) : (
                      <>
                        <span className="fa-li">
                          <i className="fa-solid fa-xmark" />
                        </span>
                        {t(
                          "venue.details.notAllowParallelEvents.description",
                          "This venue not allow overlapping events.",
                        )}
                      </>
                    )}
                  </li>
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
