import React from "react";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";

import { Coordinates, Edit as LocationEdit } from "/imports/ui/components/location/edit";

export interface Change {
  name: string;
  description: string;
  tz: string;
  loc:
    | {
        coordinates: Coordinates;
        type: string;
      }
    | undefined;
}

export interface Props {
  region: Change;
  onChange: (change: Change) => void;
}

export function RegionEditFields({ region, onChange }: Props) {
  const { t } = useTranslation();

  function timezones() {
    return moment.tz.names();
  }

  return (
    <>
      <div className="mb-3">
        <label className="form-label">{t("region.edit.name", "Name:")}</label>
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder={t("region.edit.namePlaceholder", "Full name of region")}
          value={region.name}
          onChange={(event) => {
            onChange({
              ...region,
              name: event.currentTarget.value,
            });
          }}
        />
      </div>

      <div className="mb-3 clearfix">
        <label className="form-label">
          {t(
            "region.edit.map",
            'Please add the center of the region by clicking "+" (on the right inside the map)',
          )}
        </label>

        <LocationEdit
          coordinates={region.loc?.coordinates}
          onChange={(coordinates) => {
            onChange({
              ...region,
              loc: coordinates
                ? {
                    coordinates,
                    type: "Point",
                  }
                : undefined,
            });
          }}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("region.edit.timezone", "Timezone:")}</label>
        <select
          className="form-select"
          value={region.tz}
          onChange={(event) => {
            onChange({
              ...region,
              tz: event.currentTarget.value,
            });
          }}
        >
          <option value="" disabled className="select-placeholder">
            {t("_selection.pleaseSelect")}
          </option>
          {timezones().map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="region-description-id" className="form-label">
          {t("region.edit.descriptionLabel", "Description:")}
        </label>
        <textarea
          id="region-description-id"
          className="form-control"
          placeholder={t("region.edit.descriptionPlaceholder", "An optional description")}
          value={region.description}
          onChange={(event) => {
            onChange({
              ...region,
              description: event.currentTarget.value,
            });
          }}
        />
      </div>
    </>
  );
}
