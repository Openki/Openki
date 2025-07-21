import React from "react";
import { useTranslation } from "react-i18next";

import * as Tooltips from "/imports/utils/Tooltips";

import "./styles.scss";

export interface Props {
  onClick: () => void;
}

export function RemoveDropdown({ onClick }: Props) {
  const { t } = useTranslation();

  return (
    <span
      className="dropdown ms-3"
      data-bs-toggle="tooltip"
      data-bs-title={t("eventParticipant.remove", "Remove user")}
    >
      <button
        type="button"
        className="btn-close"
        aria-expanded="false"
        data-bs-toggle="dropdown"
        onClick={() => {
          setTimeout(() => {
            Tooltips.hide();
          }, 0);
        }}
      ></button>
      <ul className="dropdown-menu dialog-dropdown right">
        <li className="dropdown-header">
          {t("eventParticipant.remove.header", "Remove user")}
          <button type="button" className="btn-close btn-close-white"></button>
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
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setTimeout(() => {
                Tooltips.hide();
              }, 0);
              onClick();
            }}
          >
            {t("eventParticipant.remove.confirm", "Remove user")}
          </button>
        </li>
      </ul>
    </span>
  );
}
