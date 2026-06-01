import React from "react";
import { useDetails } from "/imports/api/organizations/publications";

export function OrganizationName({ id }: { id: string }) {
  const [isLoading, organization] = useDetails(id);

  if (isLoading()) {
    return null;
  }

  return <>{organization?.name}</>;
}
