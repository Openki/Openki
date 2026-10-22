import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import { useDetails, useFindFilter } from "/imports/api/organizations/publications";
import * as VenuesMethods from "/imports/api/venues/methods";

import { name } from "../../../../lib/organization-name-helpers";

function OrganizationToAdd({
  venue,
  organizationId,
}: {
  venue: VenueModel;
  organizationId: string;
}) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);

  if (isLoading()) {
    return null;
  }

  return (
    <button
      className="dropdown-item btn btn-link"
      type="button"
      value={organizationId}
      onClick={async () => {
        try {
          await VenuesMethods.addEditOrganization(venue._id, organizationId);

          Alert.success(
            t(
              "venues.editOrganization.add.organizationAdded",
              "{ORGANIZATION} was added as host for {VENUE}.",
              {
                ORGANIZATION: name(organization),
                VENUE: venue.name,
              },
            ),
          );
        } catch (err) {
          Alert.serverError(
            err,
            t("venues.editOrganization.add.organizationAdded.error", "Adding failed"),
          );
        }
      }}
    >
      {name(organization)}
    </button>
  );
}

export interface Props {
  venue: VenueModel;
}

export function Add({ venue }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const user = useUser();

  const [isLoading, organizations] = useFindFilter({}, undefined, undefined, [["name", "asc"]]);

  if (isLoading() || organizations.length === 0) {
    return null;
  }

  const searchUpperCase = search.toUpperCase();

  let filteredOrganizations = organizations.filter(
    ({ name, short }) =>
      name.toUpperCase().includes(searchUpperCase) || short.toUpperCase().includes(searchUpperCase),
  );

  const usersOrganization = filteredOrganizations.filter((organization) =>
    user?.organizations.includes(organization._id),
  );
  filteredOrganizations = filteredOrganizations.filter(
    // exclude from result
    (organization) => !user?.organizations.includes(organization._id),
  );

  return (
    <div className="btn-group tag-btn organization-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle fw-light"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-plus fa-fw fw-light" />
        <span>{t("venues.editOrganization.add.btn", "Add a organization as hosts")}</span>
      </button>
      <div className="dropdown-menu dialog-dropdown dropdown-menu-scrollable-content">
        <div className="dropdown-header">
          {t("venues.editOrganization.add.header", "Choose organization")}
          <button type="button" className="btn-close" aria-label={t("_button.close")}></button>
        </div>
        <div className="p-2">
          {t(
            "venues.editOrganization.add.desc",
            "All members of that organization will be able to mange this venue.",
          )}
        </div>
        <form className="p-2">
          <input
            type="search"
            className="form-control"
            placeholder={t("venues.editOrganization.add.search", "Search for a organization")}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </form>
        {/* Show users organizations first */}
        {usersOrganization.map((organization) => (
          <OrganizationToAdd
            key={organization._id}
            venue={venue}
            organizationId={organization._id}
          />
        ))}
        {/* then the rest */}
        {filteredOrganizations.map((organization) => (
          <OrganizationToAdd
            key={organization._id}
            venue={venue}
            organizationId={organization._id}
          />
        ))}
        <div className="dropdown-divider"></div>
        <div className="dialog-dropdown-btn">
          <a
            href={Router.path("organizationDetails", { _id: "create" })}
            className="btn btn-success"
          >
            {t("profile.createNewOrganization.button")}
          </a>
        </div>
      </div>
    </div>
  );
}
