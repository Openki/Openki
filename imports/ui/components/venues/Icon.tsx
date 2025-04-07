import React from "react";
import { useUser } from "/imports/utils/react-meteor-data";

export function Icon({
  id,
  restrictedUse,
}: {
  id?: string | undefined;
  restrictedUse?: boolean | undefined;
}) {
  const user = useUser();

  function icon() {
    if (id && user?.venues.includes(id)) {
      return "fa-house-user";
    }

    if (restrictedUse) {
      return "fa-house-lock";
    }

    return "fa-house";
  }

  return <span className={`fa-solid ${icon()} fa-fw`} aria-hidden="true"></span>;
}
