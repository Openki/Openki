import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "../../../../api/organizations/publications";

export function OrganizationHeader({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation();
  const [organizationIsLoading, organization] = useDetails(organizationId);

  return (
    <>
      {t("course.edit.proposeInOrganization", "Propose new course in organization {ORGANIZATION}", {
        ORGANIZATION: organizationIsLoading() ? "..." : organization?.name,
      })}
    </>
  );
}
