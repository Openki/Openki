import React from "react";
import { useTranslation } from "react-i18next";

import { VenueModel } from "/imports/api/venues/venues";
import * as Alert from "/imports/api/alerts/alert";
import { useDetails } from "/imports/api/organizations/publications";
import * as VenuesMethods from "/imports/api/venues/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  venue: VenueModel;
  organizationId: string;
}

export function Remove({ venue, organizationId }: Props) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);

  if (isLoading()) {
    return null;
  }

  return (
    <span className="btn-group tag-btn organization-tag-btn addon align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      ></button>
      <div className="dropdown-menu dialog-dropdown">
        <div className="dropdown-header">
          {t("venues.editOrganization.remove.header", "Remove organization")}
          <button type="button" className="btn-close" aria-label={t("_button.close")}></button>
        </div>
        <div className="p-2">
          {t(
            "venues.editOrganization.remove.desc",
            "Disable members of {ORGANIZATION} to manage this venue.",
            {
              ORGANIZATION: name(organization),
            },
          )}
        </div>
        <div className="dialog-dropdown-btn">
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              try {
                await VenuesMethods.removeEditOrganization(venue._id);

                Alert.success(
                  t(
                    "venues.editOrganization.remove.organizationRemoved.success",
                    "{ORGANIZATION} was removed from {VENUE}.",
                    {
                      ORGANIZATION: name(organization),
                      VENUE: venue.name,
                    },
                  ),
                );
              } catch (err) {
                Alert.serverError(
                  err,
                  t("venues.editOrganization.remove.organizationRemoved.error", "Removing failed"),
                );
              }
            }}
          >
            {t("venues.editOrganization.remove.btn", "Remove")}
          </button>
        </div>
      </div>
    </span>
  );
}
