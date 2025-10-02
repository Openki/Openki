import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { truncate } from "lodash";

import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import * as VenuesMethods from "/imports/api/venues/methods";

import * as Metatags from "/imports/utils/metatags";
import { textPlain } from "/imports/utils/html-tools";

import { Edit } from "../../components/venues/edit";
import { ProfileLink } from "../../components/profile-link";
import { Contribution } from "../../components/Contribution";
import { Display as LocationDisplay } from "../../components/location/display";
import { format } from "/imports/utils/location-format";
import { ButtonDelete, ButtonEdit } from "../../components/buttons";
import { geoLocationLink } from "/imports/utils/geoLocationLink";
import {
  DeleteConfirmDialog,
  type Props as DeleteConfirmDialogProps,
} from "/imports/ui/components/delete-confirm-dialog";
import { EditGroup } from "./edit-group";
import { UpcomingEvents } from "./UpcomingEvents";
import { PastEvents } from "./PastEvents";

import "./styles.scss";

function Display({ venue, onEdit }: { venue: VenueModel; onEdit: () => void }) {
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
                    <span className="venue-property-title">
                      {t("venue.details.route", "How to go there:")}
                    </span>
                    <br />
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
                    <span className="venue-property-title">
                      {t("venue.details.additionalEquipment", "Additional equipment:")}
                    </span>
                    <br />
                    {venue.otherFacilities}
                  </p>
                )}
                {(!!venue.editor || !!venue.editGroup || venue.editableBy(user)) && (
                  <>
                    <span className="venue-property-title">
                      {t("location.details.hosts", "Hosts:")}
                    </span>
                    <ul className="hosts">
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
                {venue.restrictedUse &&
                  t(
                    "venue.details.restrictedUse.description",
                    "This venue can only be chosen by its hosts to publish an event.",
                  )}
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
                  onClick={async () => {
                    setVerifyDelete(true);
                  }}
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

export function VenueDetailsPage({ venue, isNew }: { venue: VenueModel; isNew: boolean }) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(isNew);

  function editAttr() {
    return {
      venue: venue as VenueModel,
      onSaved: () => {
        setEditing(false);
      },
      onCanceled: () => {
        setEditing(false);
      },
    };
  }

  useEffect(() => {
    let title;
    if (venue?._id) {
      title = venue?.name;
    } else {
      title = t("venue.edit.siteTitle.create", "Create Venue");
    }
    Metatags.setCommonTags(title, truncate(textPlain(venue?.description || ""), { length: 160 }));
  });

  return (
    <div className="container mw-md">
      {editing ? (
        <Edit {...editAttr()} />
      ) : (
        <Display
          venue={venue}
          onEdit={() => {
            setEditing(true);
          }}
        />
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("VenueDetailsPage", () => VenueDetailsPage);
