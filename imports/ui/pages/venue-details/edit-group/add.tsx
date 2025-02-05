import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { VenueModel } from "/imports/api/venues/venues";
import { useDetails, useFindFilter } from "/imports/api/groups/publications";
import * as VenuesMethods from "/imports/api/venues/methods";

import { name } from "/imports/ui/lib/group-name-helpers";

function GroupToAdd({ venue, groupId }: { venue: VenueModel; groupId: string }) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);

  if (isLoading()) {
    return null;
  }

  return (
    <button
      className="dropdown-item btn btn-link"
      type="button"
      value={groupId}
      onClick={async () => {
        try {
          await VenuesMethods.addEditGroup(venue._id, groupId);

          Alert.success(
            t("editGroup.add.groupAdded", "{GROUP} was added as host for {VENUE}.", {
              GROUP: name(group),
              VENUE: venue.name,
            }),
          );
        } catch (err) {
          Alert.serverError(err, t("editGroup.add.groupAdded.error", "Adding failed"));
        }
      }}
    >
      {name(group)}
    </button>
  );
}

export type Props = { venue: VenueModel };

export function Add({ venue }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const user = useUser();

  const [isLoading, groups] = useFindFilter({}, undefined, undefined, [["name", "asc"]]);

  if (isLoading() || groups.length === 0) {
    return null;
  }

  const searchUpperCase = search.toUpperCase();

  let filteredGroups = groups.filter(
    (group) =>
      group.name.toUpperCase().includes(searchUpperCase) ||
      group.short.toUpperCase().includes(searchUpperCase),
  );

  const usersGroup = filteredGroups.filter((group) => user?.groups.includes(group._id));
  filteredGroups = filteredGroups.filter((group) => !user?.groups.includes(group._id)); // exclude from result

  return (
    <div className="btn-group tag-btn group-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <span className="fa-solid fa-plus fa-fw" aria-hidden="true"></span>
        <span>{t("editGroup.add.btn", "Add a group as hosts")}</span>
      </button>
      <div className="dropdown-menu dialog-dropdown dropdown-menu-scrollable-content">
        <div className="dropdown-header">
          {t("editGroup.add.header", "Choose group")}
          <button type="button" className="btn-close btn-close-white"></button>
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
        {/* Show users groups first */}
        {usersGroup.map((group) => (
          <GroupToAdd key={group._id} venue={venue} groupId={group._id} />
        ))}
        {/* then the rest */}
        {filteredGroups.map((group) => (
          <GroupToAdd key={group._id} venue={venue} groupId={group._id} />
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
