import React from "react";
import { useTranslation } from "react-i18next";

import { SaveFields } from "/imports/api/venues/methods";
import { FacilityOption, Venues } from "/imports/api/venues/venues";

import { FormCheckGroup } from "../../../FormCheckGroup";

import "./styles.scss";
import { FormControl } from "/imports/ui/components/form-control";

export interface Props {
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
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="venue-edit-additional-info">
      <div className="mb-3">
        <FormControl
          id="venue.edit.shortName"
          type="text"
          label={t("venue.edit.shortName", "Abbreviation")}
          prepend="fa-solid fa-hashtag fa-fw"
          optional
          placeholder={t("venue.edit.short.placeholder", "short name")}
          value={data.short || ""}
          onChange={(value) => onShortChange(value)}
        />
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <FormControl
            id="venue-edit-maxPeople"
            type="integer"
            label={t("venue.edit.max_ppl", "Max. People")}
            optional
            min={0}
            value={data.maxPeople || 0}
            onChange={(value) => onMaxPeopleChange(value)}
          />
        </div>
        <div className="col-md">
          <FormControl
            id="venue-edit-maxWorkplace"
            type="integer"
            label={t("venue.edit.max_workplace", "Max. Workplaces")}
            optional
            min={0}
            value={data.maxWorkplaces || 0}
            onChange={(value) => onMaxWorkplacesChange(value)}
          />
        </div>
      </div>
      <div className="row gap-3 mb-3">
        <div className="col-md">
          <FormCheckGroup
            type="box"
            id="venue-edit-infra"
            label={t("venue.edit.infra", "Infrastructure")}
            optional
            options={
              Object.fromEntries(
                Venues.facilityOptions.map((option) => [option, t(`venue.facility.${option}`)]),
              ) as Record<(typeof Venues.facilityOptions)[number], React.ReactNode>
            }
            value={data.facilities || []}
            onChange={(values) => onFacilitiesChange(values)}
          />
        </div>
        <div className="col-md">
          <FormControl
            id="venue-edit-additionalEquipment"
            type="textarea"
            label={t("venue.edit.additionalEquipment", "Additional equipment")}
            optional
            value={data.otherFacilities || ""}
            onChange={(value) => onOtherFacilitiesChange(value)}
          />
        </div>
      </div>
    </div>
  );
}
