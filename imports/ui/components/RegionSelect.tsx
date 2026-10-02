import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAll } from "/imports/api/regions/publications";
import { FormControl } from "/imports/ui/components/form-control";

export function RegionSelect({
  id,
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  value: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onBlur?: (() => void) | undefined;
  error?: ReactNode;
}) {
  const { t } = useTranslation();

  const [isLoading, regions] = useAll();

  return (
    <FormControl
      id={id}
      type="select"
      label={t("group.edit.region", "Region")}
      prepend="fa-solid fa-location-dot"
      placeholder={t("_selection.pleaseSelect")}
      options={
        !isLoading() ? Object.fromEntries(regions.map((region) => [region._id, region.name])) : {}
      }
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
    />
  );
}
