import { useTranslation } from "react-i18next";
import React from "react";

import { useDetails } from "/imports/api/organizations/publications";

import { ReactSelect2 } from "/imports/ui/components/react-select2";

import { name } from "../lib/organization-name-helpers";

interface OptionProps {
  organizationId: string;
}

function Option({ organizationId }: OptionProps) {
  const [isLoading, organization] = useDetails(organizationId);

  return <option value={organizationId}>{isLoading() ? "..." : name(organization)}</option>;
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
      className="form-control"
      multiple
      value={selectedOrganizations}
      placeholder={t("filterOrganizations.placeholder.choose", "Choose organization")}
      noResults={t("filterOrganizations.noResults.noOrganizationsFound", "No organizations found")}
      onSelect={onAdd}
      onUnselect={onRemove}
    >
      {availableOrganizations.map((organizationId) => (
        <Option key={organizationId} organizationId={organizationId} />
      ))}
    </ReactSelect2>
  );
}
