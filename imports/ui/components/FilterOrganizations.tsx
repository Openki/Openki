import React from "react";
import { useTranslation } from "react-i18next";

import { ReactSelect } from "/imports/ui/components/react-select";

import { OrganizationName } from "/imports/ui/components/OrganizationName";

export interface Props {
  availableOrganizations: string[];
  selectedOrganizations: string[];
  onChange: (organizations: string[]) => void;
}

export function FilterOrganizations({
  availableOrganizations,
  selectedOrganizations,
  onChange,
}: Props) {
  const { t } = useTranslation();

  if (availableOrganizations.length === 0) {
    return null;
  }

  return (
    <ReactSelect
      isMulti
      value={selectedOrganizations.map((id) => ({
        value: id,
        label: <OrganizationName id={id} />,
      }))}
      placeholder={t("filterOrganizations.placeholder.choose", "Choose organization")}
      noOptionsMessage={() =>
        t("filterOrganizations.noResults.noOrganizationsFound", "No organizations found")
      }
      onChange={(newValue) => {
        onChange(newValue.map((o) => o.value));
      }}
      options={availableOrganizations.map((id) => ({
        value: id,
        label: <OrganizationName id={id} />,
      }))}
    />
  );
}
