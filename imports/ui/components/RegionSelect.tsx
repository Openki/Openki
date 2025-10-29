import React from "react";
import { useTranslation } from "react-i18next";
import { useAll } from "/imports/api/regions/publications";
import { FormControl } from "/imports/ui/components/form-control";

export function RegionSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange?: ((value: string) => void) | undefined;
}) {
  const { t } = useTranslation();

  const [isLoading, regions] = useAll();

  return (
    <FormControl
      id={id}
      type="select"
      label={t("course.edit.region", "Region")}
      prepend="fa-solid fa-location-dot"
      placeholder={t("_selection.pleaseSelect")}
      options={
        !isLoading()
          ? Object.fromEntries(regions.map((region) => [region._id, region.name]))
          : ({} as any)
      }
      value={value === "all" ? "" : value}
      onChange={onChange}
    />
  );
}
