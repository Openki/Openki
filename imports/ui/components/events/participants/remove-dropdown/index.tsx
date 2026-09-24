import React from "react";
import { useTranslation } from "react-i18next";

import { getUserName } from "/imports/ui/lib/getUserName";
import { useTracker } from "meteor/react-meteor-data";

import "./styles.scss";

export interface Props {
  userId: string;
  onClick: () => void;
}

export function RemoveDropdown({ userId, onClick }: Props) {
  const { t } = useTranslation();
  const userName = useTracker(() => getUserName(userId));

  return (
    <span className="dropdown ms-3">
      <button
        type="button"
        className="btn btn-link px-0"
        aria-expanded="false"
        data-bs-toggle="dropdown"
        /* 
          HACK: Is not possible to combine dropdown and tooltip. 
          So we add aria-description to describe the button. 
        */
        aria-description={t("eventParticipant.remove", "Remove user")}
      >
        {/* Give some padding to the tooltip element so the user can easy point on it */}
        <span className="p-3" data-bs-title={t("eventParticipant.remove", "Remove user")}>
          <i className="fa-solid fa-ellipsis-vertical" />
        </span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end dialog-dropdown">
        <li className="dropdown-header">
          {t("eventParticipant.remove.header", "Cancel registration?")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="dialog-dropdown-text">
          {t(
            "eventParticipant.remove.details",
            "Remove this user from this event? (The user will not be notified about this.)",
          )}
        </li>
        <li className="dialog-dropdown-btn">
          <button type="button" className="btn btn-danger" onClick={() => onClick()}>
            {t("eventParticipant.remove.confirm", "Remove {USER}", { USER: userName })}
          </button>
        </li>
      </ul>
    </span>
  );
}
