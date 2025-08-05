import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { VenueLink } from "../../components/venues/link";
import { VenueModel } from "/imports/api/venues/venues";

export function VenuesSection({ venues }: { venues: VenueModel[] }) {
  const { t } = useTranslation();
  function isVenueEditor() {
    return venues.length > 0;
  }
  return (
    <div className="page-component page-component-seperated profile-venues-list">
      <h3>{t("profile.venues", "My venues")}</h3>
      {isVenueEditor() ? (
        <ul className="list-unstyled">
          {venues.map((venue) => (
            <li key={venue._id} className="mb-3">
              <VenueLink venue={venue} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("userprofile.noOwnVenues", "You're not an editor of any venue.")}</p>
      )}
      <a
        className="btn btn-add"
        href={Router.path("venueDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewVenue.button", "Create a new venue")}
      </a>
    </div>
  );
}
