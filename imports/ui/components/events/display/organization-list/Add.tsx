import React from "react";
import { difference } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/organizations/publications";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "../../../../lib/organization-name-helpers";

function OrganizationToAdd({
  event,
  organizationId,
}: {
  event: EventModel;
  organizationId: string;
}) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);

  if (isLoading()) {
    return null;
  }

  return (
    <li>
      <button
        className="btn btn-link"
        type="button"
        value={organizationId}
        onClick={async () => {
          try {
            await EventsMethods.promote(event._id, organizationId, true);
          } catch (err) {
            Alert.serverError(err, t("groups.organizationList.organizationAdded.error"));
          }
        }}
      >
        {name(organization)}
      </button>
    </li>
  );
}

export interface Props {
  event: EventModel;
}

export function Add({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const organizationsToAdd = user && difference(user.organizations, event.allOrganizations || []);

  if (!organizationsToAdd) {
    return null;
  }

  return (
    <div className="btn-group tag-btn organization-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle fw-light"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-plus fa-fw" />
        <span>{t("groups.organizationList.addText")}</span>
      </button>
      <ul className="dropdown-menu dialog-dropdown">
        <li className="dropdown-header">
          {t("groups.organizationList.add.addOrganization")}
          <button type="button" className="btn-close" />
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        {organizationsToAdd.map((organizationId) => (
          <OrganizationToAdd key={organizationId} event={event} organizationId={organizationId} />
        ))}
        <li className="dialog-dropdown-btn">
          <a
            href={Router.path("organizationDetails", { _id: "create" })}
            className="btn btn-success"
          >
            {t("profile.createNewOrganization.button")}
          </a>
        </li>
      </ul>
    </div>
  );
}
