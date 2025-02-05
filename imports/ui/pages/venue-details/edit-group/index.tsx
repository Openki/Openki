import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { VenueModel } from "/imports/api/venues/venues";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { Add } from "./add";
import { Remove } from "./remove";

export type Props = { venue: VenueModel };

export function EditGroup({ venue }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const groupId = venue.editGroup;
  return (
    <span className="tag-group multiline">
      {groupId ? (
        <>
          <GroupTag groupId={groupId} />
          {venue.editableBy(user) && (
            <span className="btn-group tag-btn group-tag-btn addon align-top">
              <button
                type="button"
                className="dropdown-toggle"
                aria-expanded="false"
                aria-haspopup="true"
                data-bs-toggle="dropdown"
              ></button>
              <ul className="dropdown-menu dialog-dropdown">
                <li className="dropdown-header">
                  {t("editGroup.edit.header", "Edit group")}
                  <button type="button" className="btn-close btn-close-white"></button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li className="dialog-dropdown-btn">
                  <Remove venue={venue} groupId={groupId} />
                </li>
              </ul>
            </span>
          )}
        </>
      ) : (
        <Add venue={venue} />
      )}
    </span>
  );
}
