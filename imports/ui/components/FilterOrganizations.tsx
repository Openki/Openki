import React, { JSX } from "react";
import { useTranslation } from "react-i18next";

import { ReactSelect } from "/imports/ui/components/react-select";

import { OrganizationName } from "/imports/ui/components/OrganizationName";
import { components, OptionProps } from "react-select";

export interface Props {
  availableOrganizations: string[];
  selectedOrganizations: string[];
  onChange: (organizations: string[]) => void;
}
function CategoryOptionComponent(
  props: OptionProps<
    {
      value: string;
      label: JSX.Element;
    },
    true
  >,
) {
  return (
    <components.Option {...props}>
      {props.children}
      {props.isSelected && <i className="ms-1 fa-solid fa-check" />}
    </components.Option>
  );
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

  const options = availableOrganizations.map((id) => ({
    value: id,
    label: <OrganizationName id={id} />,
  }));

  const value = options.filter((option) => selectedOrganizations.includes(option.value));

  return (
    <ReactSelect
      isMulti
      value={value}
      placeholder={t("filterOrganizations.placeholder.choose", "Choose organization")}
      noOptionsMessage={() =>
        t("filterOrganizations.noResults.noOrganizationsFound", "No organizations found")
      }
      components={{
        Option: CategoryOptionComponent,
      }}
      hideSelectedOptions={false}
      onChange={(newValue) => {
        onChange(newValue.map((o) => o.value));
      }}
      options={options}
    />
  );
}
