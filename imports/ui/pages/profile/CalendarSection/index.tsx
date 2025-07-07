import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import "./styles.scss";

export function CalendarSection() {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.calendar", "My events")}</h3>
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {t("profile.calendar.add", "Add my events to my calendar")}
        </button>
        <ul className="dropdown-menu">
          <li>
            <a
              className="dropdown-item"
              href={`https://${location.host}/cal?participant=${user?._id}`}
            >
              iCal
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href={`https://${location.host}/cal?participant=${user?._id}`}
            >
              Google
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href={`webcal://${location.host}/cal?participant=${user?._id}`}
            >
              Outlook
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href={`webcal://${location.host}/cal?participant=${user?._id}`}
            >
              Apple
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
