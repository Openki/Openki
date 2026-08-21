import React from "react";
import { useTranslation } from "react-i18next";

import { ReactSelect } from "/imports/ui/components/react-select";

import { OrganizationName } from "/imports/ui/components/OrganizationName";

export interface Props {
  availableOrganizations: string[] | undefined;
  selectedOrganizations: string[] | undefined;
  onChange: (organizations: string[]) => void;
}

export function FilterOrganizations({
  availableOrganizations = [],
  selectedOrganizations = [],
  onChange,
}: Props) {
  const { t } = useTranslation();

  if (availableOrganizations.length === 0) {
    return null;
  }

  return (
    <ReactSelect
      isMulti
      noOptionsMessage={() =>
        t("filterOrganizations.noResults.noOrganizationsFound", "No organizations found")
      }
      value={selectedOrganizations.map((o) => ({
        value: o,
        label: <OrganizationName id={o} />,
      }))}
      placeholder={t("filterOrganizations.placeholder.choose", "Choose organization")}
      onChange={(newValue) => {
        onChange(newValue.map((o) => o.value));
      }}
      options={availableOrganizations.map((o) => ({
        value: o,
        label: <OrganizationName id={o} />,
      }))}
    />
  );
}
