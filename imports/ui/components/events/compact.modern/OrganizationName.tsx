import React from "react";
import { useDetails } from "../../../../api/organizations/publications";

export function GroupName({ id }: { id: string }) {
  const [isLoading, group] = useDetails(id);

  if (isLoading()) {
    return null;
  }

  return <>{group?.name}</>;
}
