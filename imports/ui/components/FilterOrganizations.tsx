import { useTranslation } from "react-i18next";
import React from "react";

import { useDetails } from "../../api/organizations/publications";

import { ReactSelect2 } from "/imports/ui/components/react-select2";

import { name } from "../lib/organization-name-helpers";

interface OptionProps {
  organizationId: string;
}

function Option({ organizationId }: OptionProps) {
  const [isLoading, organization] = useDetails(organizationId);

  return (
    <option className="groups-select-option" value={organizationId}>
      {isLoading() ? "..." : name(organization)}
    </option>
  );
}

export interface Props {
  availableOrganizations: string[] | undefined;
  selectedOrganizations: string[] | undefined;
  onAdd: (organization: string) => void;
  onRemove: (organization: string) => void;
}

export function FilterOrganizations({
  availableOrganizations,
  selectedOrganizations,
  onAdd,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  if (!availableOrganizations) {
    return null;
  }

  return (
    <ReactSelect2
      className="groups-select form-control"
      multiple={true}
      value={selectedOrganizations}
      placeholder={t("filterGroups.placeholder", "Choose group")}
      noResults={t("filterGroups.no-groups-found", "No groups found")}
      onSelect={onAdd}
      onUnselect={onRemove}
    >
      {availableOrganizations.map((organizationId) => (
        <Option key={organizationId} organizationId={organizationId} />
      ))}
    </ReactSelect2>
  );
}
