import React from "react";
import { useTranslation } from "react-i18next";

import { SaveFields } from "/imports/api/venues/methods";
import { FacilityOption, Venues } from "/imports/api/venues/venues";

import { CheckGroup } from "/imports/ui/components/events/edit/form-control/CheckGroup";

import "./styles.scss";

export interface Data {
  data: Pick<SaveFields, "short" | "maxPeople" | "maxWorkplaces" | "facilities"> & {
    otherFacilities?: string | undefined;
  };
  onShortChange: (newValue: string) => void;
  onMaxPeopleChange: (newValue: number) => void;
  onMaxWorkplacesChange: (newValue: number) => void;
  onFacilitiesChange: (newValue: FacilityOption[]) => void;
  onOtherFacilitiesChange: (newValue: string) => void;
}

export function AdditionalInfo({
  data,
  onShortChange,
  onMaxPeopleChange,
  onMaxWorkplacesChange,
  onFacilitiesChange,
  onOtherFacilitiesChange,
}: Data) {
  const { t } = useTranslation();

  return (
    <div className="venue-edit-additional-info">
      <div className="mb-3">
        <label className="form-label">{t("venue.edit.shortName", "Abbreviation")}</label>
        <div className="input-group">
          <span className="input-group-text">
            <span className="fa-solid fa-hashtag fa-fw" aria-hidden="true"></span>
          </span>
          <input
            className="form-control"
            placeholder={`${t("venue.edit.short.placeholder", "short name")} ${t(
              "_inputField.optional",
            )}`}
            value={data.short}
            onChange={(event) => {
              onShortChange(event.currentTarget.value);
            }}
          />
        </div>
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <label className="form-label">{t("venue.edit.max_ppl", "Max. People")}</label>
          <input
            type="number"
            className="form-control"
            size={4}
            min={0}
            value={data.maxPeople || ""}
            onChange={(event) => {
              const newValue = Number.parseInt(event.currentTarget.value, 10) || 0; // give back 0 in case of NaN
              onMaxPeopleChange(newValue);
            }}
          />
        </div>
        <div className="col-md">
          <label className="form-label">{t("venue.edit.max_workplace", "Max. Workplaces")}</label>
          <input
            type="number"
            className="form-control"
            size={4}
            min={0}
            value={data.maxWorkplaces || ""}
            onChange={(event) => {
              const newValue = Number.parseInt(event.currentTarget.value, 10) || 0; // give back 0 in case of NaN
              onMaxWorkplacesChange(newValue);
            }}
          />
        </div>
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <CheckGroup
            type="switch"
            id="venue-edit-infra"
            label={t("venue.edit.infra", "Infrastructure")}
            options={
              Object.fromEntries(
                Venues.facilityOptions.map((option) => [option, t(`venue.facility.${option}`)]),
              ) as Record<(typeof Venues.facilityOptions)[number], React.ReactNode>
            }
            value={data.facilities || []}
            onChange={(values) => {
              onFacilitiesChange(values);
            }}
          />
        </div>
        <div className="col-md">
          <label className="form-label">
            {t("venue.edit.additionalEquipment", "Additional equipment")}
          </label>
          <textarea
            className="form-control"
            onChange={(event) => {
              onOtherFacilitiesChange(event.currentTarget.value);
            }}
            value={data.otherFacilities}
          />
        </div>
      </div>
    </div>
  );
}
