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
      data-bs-title={t("eventParticipant.remove", "Withdraw registration")}
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
          {t("eventParticipant.remove.header", "Withdraw registration")}
          <button type="button" className="btn-close btn-close-white"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="dialog-dropdown-text">
          {t(
            "eventParticipant.remove.details",
            "Withdraw the registration of this user? (The user will not be notified about this.)",
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
            {t("eventParticipant.remove.confirm", "Withdraw")}
          </button>
        </li>
      </ul>
    </span>
  );
}
