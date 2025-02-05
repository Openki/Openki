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
  );
}
