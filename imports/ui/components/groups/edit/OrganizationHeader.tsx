import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "../../../../api/organizations/publications";

export function OrganizationHeader({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation();
  const [organizationIsLoading, organization] = useDetails(organizationId);

  return (
    <>
      {t("group.edit.proposeInOrganization", "Propose new group in organization {ORGANIZATION}", {
        ORGANIZATION: organizationIsLoading() ? "..." : organization?.name,
      })}
    </>
  );
}
