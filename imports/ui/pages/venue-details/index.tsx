import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";

import * as Events from "/imports/api/events/publications";
import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import * as VenuesMethods from "/imports/api/venues/methods";
import { useDetails } from "/imports/api/venues/publications";

import { useReactiveNow } from "/imports/utils/reactive-now";
import * as Metatags from "/imports/utils/metatags";
import { textPlain } from "/imports/utils/html-tools";
import { truncate } from "/imports/utils/string-tools";

import { useTranslation } from "react-i18next";
import { Edit } from "../../components/venues/edit";
import { ProfileLink } from "../../components/profile-link";
import { Contribution } from "../../components/contribution";
import { Display as LocationDisplay } from "../../components/location/display";
import { format } from "/imports/utils/location-format";
import { ButtonDelete, ButtonEdit } from "../../components/buttons";
import { EventList } from "../../components/events/list";
import { geoLocationLink } from "/imports/utils/geoLocationLink";
import {
  DeleteConfirmDialog,
  type Props as DeleteConfirmDialogProps,
} from "/imports/ui/components/delete-confirm-dialog";

import "./styles.scss";

const UpcomingEventLimitDefault = 12;
const PastEventLimitDefault = 3;
const EventLoadingBlockSize = 9;

function Display({ venue, onEdit }: { venue: VenueModel; onEdit: () => void }) {
  const { t } = useTranslation();

  const [verifyDelete, setVerifyDelete] = useState(false);
  const [upcomingEventLimit, setUpcomingEventLimit] = useState(UpcomingEventLimitDefault);
  const [pastEventLimit, setPastEventLimit] = useState(PastEventLimitDefault);

  const now = useReactiveNow();

  const [upcomingEventsIsLoading, upcomingEvents] = Events.useFindFilter(
    { venue: venue._id, after: now },
    // Add one to the limit so we know there is more to show
    upcomingEventLimit + 1,
  );

  const [pastEventsIsLoading, pastEvents] = Events.useFindFilter(
    { venue: venue._id, before: now },
    // Add one to the limit so we know there is more to show
    pastEventLimit + 1,
  );

  function mayEdit() {
    return venue.editableBy(Meteor.user());
  }
  function facilityNames() {
    return Object.keys(venue.facilities);
  }
  function facilitiesDisplay(name: string) {
    return t(`venue.facility.${name}`);
  }
  function getUpcomingEvents() {
    const events = upcomingEvents;

    if (events.length > upcomingEventLimit) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  }
  function hasMoreUpcomingEvents() {
    const count = upcomingEvents.length;
    return count > upcomingEventLimit;
  }
  function getPastEvents() {
    const events = pastEvents;

    if (events.length > pastEventLimit) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  }
  function hasMorePastEvents() {
    const count = pastEvents.length;
    return count > pastEventLimit;
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

  if (upcomingEventsIsLoading() || pastEventsIsLoading()) {
    return null;
  }

  return (
    <>
      <div className="page-component">
        <div className="details-header location-details-header">
          <h3>
            {venue.name} {venue.short ? <small>{venue.short}</small> : null}
          </h3>
          <p dangerouslySetInnerHTML={{ __html: venue.description }}></p>
        </div>

        <div className="details-body location-details-body">
          <div className="details-content">
            <div className="row">
              <div className={venue.loc ? "col-md-7" : "col"}>
                {venue.editor ? (
                  <>
                    <span className="venue-property-title">
                      {t("location.details.hosts", "Hosts:")}
                    </span>
                    <ul className="hosts">
                      <li>
                        <ProfileLink userId={venue.editor} />
                        <Contribution userId={venue.editor} />
                      </li>
                    </ul>
                  </>
                ) : null}

                {venue.address ? (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.address", "Address:")}
                    </span>{" "}
                    {venue.address}
                  </p>
                ) : null}
                {venue.route ? (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.route", "How to go there:")}
                    </span>
                    <br />
                    <span style={{ whiteSpace: "pre-line;" }}>{venue.route}</span>
                  </p>
                ) : null}
                {venue.maxPeople ? (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.max_ppl", "Maximum People:")}
                    </span>{" "}
                    {venue.maxPeople}
                  </p>
                ) : null}
                {venue.maxWorkplaces ? (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.max_workplaces", "Maximum Workplaces:")}
                    </span>{" "}
                    {venue.maxWorkplaces}
                  </p>
                ) : null}
                {facilityNames().length > 0 ? (
                  <>
                    <span className="venue-property-title">
                      {t("venue.details.availableInfrastructure", "Available infrastructure:")}
                    </span>
                    <ul>
                      {facilityNames().map((facilityName) => (
                        <li key={facilityName}>{facilitiesDisplay(facilityName)}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {venue.otherFacilities ? (
                  <p>
                    <span className="venue-property-title">
                      {t("venue.details.additionalEquipment", "Additional equipment:")}
                    </span>
                    <br />
                    {venue.otherFacilities}
                  </p>
                ) : null}
              </div>
              {venue.loc ? (
                <div className="col-md-5">
                  <div className="details-map">
                    <LocationDisplay coordinates={venue.loc.coordinates} />
                    <div className="coordinates">
                      <a href={geoLocationLink(venue.loc)}>
                        {t("venueDetails.coordinates", "Coordinates:")} {format(t, venue.loc)}
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {mayEdit() ? (
          <>
            <div className="actions">
              <ButtonEdit
                onClick={() => {
                  onEdit();
                  setVerifyDelete(false);
                }}
              />
              {!verifyDelete ? (
                <ButtonDelete
                  onClick={() => {
                    setVerifyDelete(true);
                  }}
                />
              ) : (
                <DeleteConfirmDialog {...deleteConfirmDialogAttr()} />
              )}
            </div>
          </>
        ) : null}
      </div>
      {getUpcomingEvents().length ? (
        <div className="page-component">
          <h2>{t("venue.details.upcomingEvents", "Upcoming events at this venue:")}</h2>
          <EventList dataEvents={getUpcomingEvents()} withDate={true} withVenue={false} />
          {hasMoreUpcomingEvents() ? (
            <>
              <div className="clearfix"></div>
              <button
                type="button"
                className="btn btn-add"
                onClick={() => {
                  setUpcomingEventLimit(upcomingEventLimit + EventLoadingBlockSize);
                }}
              >
                {t("_button.more")}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      {getPastEvents().length ? (
        <div className="page-component">
          <h2>{t("venue.details.pastEvents", "Past events:")}</h2>
          <EventList dataEvents={getPastEvents()} withDate={true} withVenue={false} />
          {hasMorePastEvents() ? (
            <>
              <div className="clearfix"></div>
              <button
                type="button"
                className="btn btn-add"
                onClick={() => {
                  setPastEventLimit(pastEventLimit + EventLoadingBlockSize);
                }}
              >
                {t("_button.more")}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export function VenueDetailsPage({ venue: venue2 }: { venue: VenueModel }) {
  const { t } = useTranslation();

  // for blaze, can be removed after migration
  // subscribe in react to keep reactivity
  // eslint-disable-next-line prefer-const
  let [isLoading, venue] = useDetails(venue2._id || "-1");
  if (!venue) {
    venue = venue2;
  }

  const [editing, setEditing] = useState(!venue?._id);

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
    Metatags.setCommonTags(title, truncate(textPlain(venue?.description || ""), 160));
  });

  if (isLoading()) {
    return null;
  }

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
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("VenueDetailsPage", () => VenueDetailsPage);
