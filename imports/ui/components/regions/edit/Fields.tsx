import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";
import { getLocation } from "/imports/utils/user-location";

import { Coordinates } from "/imports/ui/components/location/edit";
import { FormControl } from "/imports/ui/components/form-control";
import { FormMap } from "/imports/ui/components/location/FormMap";

export interface Change {
  name: string;
  description: string;
  tz: string;
  loc:
    | {
        coordinates: Coordinates;
        type: "Point";
      }
    | undefined;
}

export interface Props {
  region: Change;
  onChange: (change: Change) => void;
  errors: Partial<Record<"regionName" | "location", React.ReactNode>>;
  onBlur: (field: "regionName" | "location") => void;
}

export function Fields({ region, onChange, errors, onBlur }: Props) {
  const { t } = useTranslation();

  function timezones() {
    return moment.tz.names();
  }

  const [center, setCenter] = useState(region.loc?.coordinates);

  useEffect(() => {
    if (!center) {
      (async () => {
        try {
          setCenter((await getLocation()).coordinates);
        } catch {
          setCenter([47.384881, 8.53341]);
        }
      })();
    }
  }, [center]);

  return (
    <>
      <div className="mb-3">
        <FormControl
          id="region-edit-name"
          type="text"
          size="large"
          label={t("region.edit.name", "Name")}
          value={region.name}
          onChange={(value) => onChange({ ...region, name: value })}
          onBlur={() => onBlur("regionName")}
          error={errors.regionName}
        />
      </div>

      <div className="mb-3">
        {!!(region.loc?.coordinates || center) && (
          <FormMap
            id="region-edit-map"
            label={t(
              "region.edit.map",
              'Please add the center of the region by clicking "+" (on the right inside the map)',
            )}
            value={region.loc?.coordinates as any}
            center={!region.loc?.coordinates ? center : undefined}
            onChange={(newValue) => {
              onChange({
                ...region,
                loc: newValue?.coordinates
                  ? {
                      coordinates: newValue.coordinates,
                      type: "Point",
                    }
                  : undefined,
              });
            }}
            onBlur={() => onBlur("location")}
            error={errors.location}
          />
        )}
      </div>

      <div className="mb-3">
        <FormControl
          id="region-edit-timezone"
          type="select"
          label={t("region.edit.timezone", "Timezone")}
          placeholder={t("_selection.pleaseSelect")}
          options={Object.fromEntries(timezones().map((tz) => [tz, tz]))}
          value={region.tz}
          onChange={(value) => onChange({ ...region, tz: value })}
        />
      </div>

      <div className="mb-3">
        <FormControl
          id="region-description-id"
          type="textarea"
          optional
          label={t("region.edit.descriptionLabel", "Description")}
          value={region.description}
          onChange={(value) => onChange({ ...region, description: value })}
        />
      </div>
    </>
  );
}
