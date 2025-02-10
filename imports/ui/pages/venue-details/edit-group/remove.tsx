import React from "react";
import { useTranslation } from "react-i18next";

import { VenueModel } from "/imports/api/venues/venues";
import * as Alert from "/imports/api/alerts/alert";
import { useDetails } from "/imports/api/groups/publications";
import * as VenuesMethods from "/imports/api/venues/methods";

import { name } from "/imports/ui/lib/group-name-helpers";

export type Props = {
  venue: VenueModel;
  groupId: string;
};

export function Remove({ venue, groupId }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);

  if (isLoading()) {
    return null;
  }

  return (
    <span className="btn-group tag-btn group-tag-btn addon align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      ></button>
      <div className="dropdown-menu dialog-dropdown">
        <div className="dropdown-header">
          {t("editGroup.remove.header", "Remove group")}
          <button type="button" className="btn-close btn-close-white"></button>
        </div>
        <div className="p-2">
          {t("editGroup.remove.desc", "Disable members of {GROUP} to manage this venue.", {
            GROUP: name(group),
          })}
        </div>
        <div className="dialog-dropdown-btn">
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              try {
                await VenuesMethods.removeEditGroup(venue._id);

                Alert.success(
                  t("editGroup.remove.groupRemoved", "{GROUP} was removed from {VENUE}.", {
                    GROUP: name(group),
                    VENUE: venue.name,
                  }),
                );
              } catch (err) {
                Alert.serverError(err, t("editGroup.remove.groupRemoved.error", "Removing failed"));
              }
            }}
          >
            {t("editGroup.remove.btn", "Remove")}
          </button>
        </div>
      </div>
    </span>
  );
}
