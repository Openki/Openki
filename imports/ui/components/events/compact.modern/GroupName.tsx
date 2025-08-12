import React from "react";
import { useDetails } from "/imports/api/groups/publications";

export function GroupName({ id }: { id: string }) {
  const [isLoading, group] = useDetails(id);

  if (isLoading()) {
    return null;
  }

  return <>{group?.name}</>;
}
