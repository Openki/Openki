import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import * as Alert from "/imports/api/alerts/alert";

function generateForOutlook(url: string) {
  const baseUrl = "https://outlook.live.com/calendar/0/addfromweb/?url=";
  return baseUrl + encodeURIComponent(url);
}

function generateForGoogle(url: string) {
  const baseUrl = "https://calendar.google.com/calendar/u/0/r?cid=";
  return baseUrl + encodeURIComponent(url);
}

export function CalendarSection() {
  const { t } = useTranslation();
  const user = useUser();

  const webcalUrl = `webcal://${location.host}/cal?participant=${user?._id}`;

  return (
    <div id="my-events" className="page-component page-component-seperated">
      <h3>{t("profile.calendar", "My events")}</h3>
      <p>
        {t(
          "profile.calendar.description",
          "Events added to your calendar will be automatically updated, when changed here.",
        )}
      </p>
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
              href={webcalUrl}
              onClick={() => {
                Alert.success(
                  t(
                    "profile.calendar.iCal.message",
                    "Your calendar app should now appear. If not, try an other option.",
                  ),
                );
              }}
            >
              <i className="fa-fw fa-solid fa-download" />{" "}
              {t("profile.calendar.iCal", "Into app on my local device")}
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href={generateForGoogle(webcalUrl)}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />{" "}
              {t("profile.calendar.google", "Google Kalender (Web)")}
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href={generateForOutlook(webcalUrl)}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />{" "}
              {t("profile.calendar.outlook", "Outlook.com (Web)")}
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              href="#"
              onClick={() => {
                navigator.clipboard.writeText(webcalUrl);
                Alert.success(t("profile.calendar.urlCopied", "Url copied to the clipboard."));
              }}
            >
              <i className="fa-fw fa-regular fa-copy" />{" "}
              {t("profile.calendar.copyUrl", "Copy url to clipboard")}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
