import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import { useDetails, useFindFilter } from "../../../../../api/organizations/publications";
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
            t("editGroup.add.groupAdded", "{GROUP} was added as host for {VENUE}.", {
              GROUP: name(organization),
              VENUE: venue.name,
            }),
          );
        } catch (err) {
          Alert.serverError(err, t("editGroup.add.groupAdded.error", "Adding failed"));
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
    (organization) =>
      organization.name.toUpperCase().includes(searchUpperCase) ||
      organization.short.toUpperCase().includes(searchUpperCase),
  );

  const usersOrganization = filteredOrganizations.filter((organization) =>
    user?.groups.includes(organization._id),
  );
  filteredOrganizations = filteredOrganizations.filter(
    // exclude from result
    (organization) => !user?.groups.includes(organization._id),
  );

  return (
    <div className="btn-group tag-btn group-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-plus fa-fw" />
        <span>{t("editGroup.add.btn", "Add a group as hosts")}</span>
      </button>
      <div className="dropdown-menu dialog-dropdown dropdown-menu-scrollable-content">
        <div className="dropdown-header">
          {t("editGroup.add.header", "Choose group")}
          <button type="button" className="btn-close"></button>
        </div>
        <div className="p-2">
          {t("editGroup.add.desc", "All members of that group will be able to mange this venue.")}
        </div>
        <form className="p-2">
          <input
            type="search"
            className="form-control"
            placeholder={t("editGroup.add.search", "Search for a group")}
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
          <a href={Router.path("groupDetails", { _id: "create" })} className="btn btn-success">
            {t("profile.createNewGroup.button")}
          </a>
        </div>
      </div>
    </div>
  );
}
