import React from "react";
import { useTranslation } from "react-i18next";

import { VenueModel, Venues } from "/imports/api/venues/venues";

import "./styles.scss";

export function AdditionalInfo(data: VenueModel) {
  const { t } = useTranslation();

  function facilityOptions() {
    return Venues.facilityOptions;
  }
  function facilitiesCheck(name: string) {
    const attrs: {
      class: string;
      type: string;
      value: string;
      checked?: boolean;
    } = {
      class: `form-check-input js-${name}`,
      type: "checkbox",
      value: "",
    };
    if (data.facilities[name]) {
      attrs.checked = true;
    }
    return attrs;
  }
  function facilitiesDisplay(name: string) {
    return `venue.facility.${name}`;
  }

  return (
    <div className="venue-edit-additional-info">
      <div className="mb-3">
        <label className="form-label">{t("venue.edit.shortName", "Abbreviation")}</label>
        <div className="input-group">
          <span className="input-group-text">
            <span className="fa-solid fa-hashtag fa-fw" aria-hidden="true"></span>
          </span>
          <input
            className="form-control js-short"
            placeholder={`${t("venue.edit.short.placeholder", "short name")} ${t(
              "_inputField.optional",
            )}`}
            value={data.short}
          />
        </div>
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <label className="form-label">{t("venue.edit.max_ppl", "Max. People")}</label>
          <input
            type="number"
            className="form-control js-maxPeople"
            size={4}
            value={data.maxPeople}
          />
        </div>
        <div className="col-md">
          <label className="form-label">{t("venue.edit.max_workplace", "Max. Workplaces")}</label>
          <input
            type="number"
            className="form-control js-maxWorkplaces"
            size={4}
            value={data.maxWorkplaces}
          />
        </div>
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <label className="form-label">{t("venue.edit.infra", "Infrastructure")}</label>
          {facilityOptions().map((facility) => (
            <div className="form-check" key={facility}>
              <input {...facilitiesCheck(facility)} id={`venueEdit${facility}Check`} />
              <label className="form-check-label" htmlFor={`venueEdit${facility}Check`}>
                {t(facilitiesDisplay(facility))}
              </label>
            </div>
          ))}
        </div>
        <div className="col-md">
          <label className="form-label">
            {t("venue.edit.additionalEquipment", "Additional equipment")}
          </label>
          <textarea className="form-control js-otherFacilities">{data.otherFacilities}</textarea>
        </div>
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("VenueEditAdditionalInfo", () => AdditionalInfo);
